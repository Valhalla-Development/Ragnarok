/* eslint-disable no-nested-ternary */
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import converter from 'number-to-words-en';
import ms from 'ms';
import SlashCommand from '../../Structures/SlashCommand.js';
import Balance from '../../Mongo/Schemas/Balance.js';

const data = new SlashCommandBuilder()
  .setName('balance')
  .setDescription('Displays balance of user')
  .addUserOption((option) => option.setName('user').setDescription('Select a user'));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Displays balance of user',
      category: 'Economy',
      options: data
    });
  }

  async run(interaction) {
    const member = interaction.options.getMember('user') || interaction.member;

    const balance = await Balance.findOne({ IdJoined: `${member.user.id}-${interaction.guild.id}` });

    if (!balance) {
      const limitE = new EmbedBuilder()
        .setAuthor({
          name: `${member.user.tag}`,
          iconURL: member.user.avatarURL()
        })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Balance**`,
          value: `**◎ Error:** ${member} does not have any balance!`
        });
      interaction.reply({ ephemeral: true, embeds: [limitE] });
      return;
    }

    const userRank = await Balance.find({ GuildId: interaction.guild.id }).sort({ Total: -1 });
    const user = userRank.find((b) => b.IdJoined === `${member.user.id}-${interaction.guild.id}`);
    const rankPos = converter.toOrdinal(userRank.indexOf(user) + 1);

    const date = new Date().getTime();

    if (member.user.id === interaction.user.id) {
      let foundItemList = JSON.parse(balance.Items);
      let foundBoostList = JSON.parse(balance.Boosts);
      let foundPlotList = JSON.parse(balance.FarmPlot);
      let foundHarvestList = JSON.parse(balance.HarvestedCrops);

      let claimUserTime;
      if (balance.ClaimNewUser) {
        const endTime = balance.ClaimNewUser;
        claimUserTime = Math.round(endTime / 1000);
      }

      if (!foundItemList) {
        foundItemList = {};
      }

      if (!foundBoostList) {
        foundBoostList = {};
      }

      if (!foundPlotList) {
        foundPlotList = [];
      }

      if (!foundHarvestList) {
        foundHarvestList = [];
      }

      let currentTotalSeeds = 0;

      if (foundItemList.cornSeeds) {
        currentTotalSeeds += Number(foundItemList.cornSeeds);
      } else {
        currentTotalSeeds += Number(0);
      }
      if (foundItemList.wheatSeeds) {
        currentTotalSeeds += Number(foundItemList.wheatSeeds);
      } else {
        currentTotalSeeds += Number(0);
      }
      if (foundItemList.potatoSeeds) {
        currentTotalSeeds += Number(foundItemList.potatoSeeds);
      } else {
        currentTotalSeeds += Number(0);
      }
      if (foundItemList.tomatoSeeds) {
        currentTotalSeeds += Number(foundItemList.tomatoSeeds);
      } else {
        currentTotalSeeds += Number(0);
      }

      let currentTotalFish = 0;

      if (foundItemList.trout) {
        currentTotalFish += Number(foundItemList.trout);
      } else {
        currentTotalFish += Number(0);
      }
      if (foundItemList.kingSalmon) {
        currentTotalFish += Number(foundItemList.kingSalmon);
      } else {
        currentTotalFish += Number(0);
      }
      if (foundItemList.swordfish) {
        currentTotalFish += Number(foundItemList.swordfish);
      } else {
        currentTotalFish += Number(0);
      }
      if (foundItemList.pufferfish) {
        currentTotalFish += Number(foundItemList.pufferfish);
      } else {
        currentTotalFish += Number(0);
      }

      let currentTotalFarm = 0;

      if (foundHarvestList) {
        currentTotalFarm += Number(foundHarvestList.filter((key) => key.cropType === 'corn').length);
        currentTotalFarm += Number(foundHarvestList.filter((key) => key.cropType === 'wheat').length);
        currentTotalFarm += Number(foundHarvestList.filter((key) => key.cropType === 'potato').length);
        currentTotalFarm += Number(foundHarvestList.filter((key) => key.cropType === 'tomato').length);
      }

      const embed1 = new EmbedBuilder()
        .setAuthor({
          name: `${member.user.username}'s Balance`,
          iconURL: member.user.avatarURL()
        })
        .setDescription(`Leaderboard Rank: \`${rankPos}\``)
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields(
          {
            name: 'Cash',
            value: `<:coin:706659001164628008> \`${balance.Cash.toLocaleString('en')}\``,
            inline: true
          },
          {
            name: 'Bank',
            value: `<:coin:706659001164628008> \`${balance.Bank.toLocaleString('en')}\``,
            inline: true
          },
          {
            name: 'Total',
            value: `<:coin:706659001164628008> \`${balance.Total.toLocaleString('en')}\``,
            inline: true
          },
          {
            name: 'Steal Cooldown',
            value: `${Date.now() > balance.StealCool ? '`Available!`' : `\`${ms(balance.StealCool - date, { long: true })}\``}`,
            inline: true
          },
          {
            name: 'Fish Cooldown',
            value: `${
              !foundItemList.fishingRod
                ? '`Rod Not Owned`'
                : Date.now() > balance.FishCool
                ? '`Available!`'
                : `\`${ms(balance.FishCool - date, { long: true })}\``
            }`,
            inline: true
          },
          {
            name: 'Farm Cooldown',
            value: `${Date.now() > balance.FarmCool ? '`Available!`' : `\`${ms(balance.FarmCool - date, { long: true })}\``}`,
            inline: true
          },
          {
            name: 'Seed Bag',
            value: `${
              foundBoostList.seedBag
                ? `\`${Number(currentTotalSeeds).toLocaleString('en')}/${Number(foundBoostList.seedBag).toLocaleString('en')}\``
                : '`Not Owned`'
            }`,
            inline: true
          },
          {
            name: 'Fish Bag',
            value: `${
              foundBoostList.fishBag
                ? `\`${Number(currentTotalFish).toLocaleString('en')}/${Number(foundBoostList.fishBag).toLocaleString('en')}\``
                : '`Not Owned`'
            }`,
            inline: true
          },
          {
            name: 'Farm Bag',
            value: `${
              foundBoostList.farmBag
                ? `\`${Number(currentTotalFarm).toLocaleString('en')}/${Number(foundBoostList.farmBag).toLocaleString('en')}\``
                : '`Not Owned`'
            }`,
            inline: true
          },
          {
            name: 'Farm Plot',
            value: `${
              foundBoostList.FarmPlot
                ? `\`${foundPlotList.length.toLocaleString('en')}/${Number(foundBoostList.FarmPlot).toLocaleString('en')}\``
                : '`Not Owned`'
            }`,
            inline: true
          },
          {
            name: '**◎ Claim Cooldown**',
            value: `\n**Hourly:** ${
              balance.ClaimNewUser
                ? Date.now() > balance.ClaimNewUser
                  ? '`Available`'
                  : `<t:${claimUserTime}:R>`
                : Date.now() > balance.Hourly
                ? '`Available!`'
                : `\`${ms(balance.Hourly - date, { long: true })}\``
            }
					\n**Daily:** ${
            balance.ClaimNewUser
              ? Date.now() > balance.ClaimNewUser
                ? '`Available`'
                : `<t:${claimUserTime}:R>`
              : Date.now() > balance.Daily
              ? '`Available!`'
              : `\`${ms(balance.Daily - date, { long: true })}\``
          }
					\n**Weekly:** ${
            balance.ClaimNewUser
              ? Date.now() > balance.ClaimNewUser
                ? '`Available`'
                : `<t:${claimUserTime}:R>`
              : Date.now() > balance.Weekly
              ? '`Available!`'
              : `\`${ms(balance.Weekly - date, { long: true })}\``
          }
					\n**Monthly:** ${
            balance.ClaimNewUser
              ? Date.now() > balance.ClaimNewUser
                ? '`Available`'
                : `<t:${claimUserTime}:R>`
              : Date.now() > balance.Monthly
              ? '`Available!`'
              : `\`${ms(balance.Monthly - date, { long: true })}\``
          }`
          }
        );
      interaction.reply({ embeds: [embed1] });
      return;
    }

    const embed1 = new EmbedBuilder()
      .setAuthor({
        name: `${member.user.username}'s Balance`,
        iconURL: member.user.avatarURL()
      })
      .setDescription(`Leaderboard Rank: \`${rankPos}\``)
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields(
        {
          name: 'Cash',
          value: `<:coin:706659001164628008> \`${balance.Cash.toLocaleString('en')}\``,
          inline: true
        },
        {
          name: 'Bank',
          value: `<:coin:706659001164628008> \`${balance.Bank.toLocaleString('en')}\``,
          inline: true
        },
        {
          name: 'Total',
          value: `<:coin:706659001164628008> \`${balance.Total.toLocaleString('en')}\``,
          inline: true
        }
      )
      .setTimestamp();
    interaction.reply({ embeds: [embed1] });
  }
};

export default SlashCommandF;
