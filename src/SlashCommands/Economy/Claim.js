import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import ms from 'ms';
import SlashCommand from '../../Structures/SlashCommand.js';
import Balance from '../../Mongo/Schemas/Balance.js';

const data = new SlashCommandBuilder()
  .setName('claim')
  .setDescription('Claim rewards')
  .addSubcommand((subcommand) => subcommand.setName('view').setDescription('View claims'))
  .addSubcommand((subcommand) => subcommand.setName('all').setDescription('Claim all'));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Claim rewards',
      category: 'Economy',
      options: data
    });
  }

  async run(interaction) {
    const balance = await Balance.findOne({ idJoined: `${interaction.user.id}-${interaction.guild.id}` });

    const type = interaction.options.getSubcommand();

    if (type === 'view') {
      const date = new Date();

      const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Claim**`,
        value: `**◎ Hourly:** \`${Date.now() > balance.hourly ? 'Available!' : ms(balance.hourly - date.getTime(), { long: true })}\`
				**◎ Daily:** \`${Date.now() > balance.daily ? 'Available!' : ms(balance.daily - date.getTime(), { long: true })}\`
				**◎ Weekly:** \`${Date.now() > balance.weekly ? 'Available!' : ms(balance.weekly - date.getTime(), { long: true })}\`
				**◎ Monthly:** \`${Date.now() > balance.monthly ? 'Available!' : ms(balance.monthly - date.getTime(), { long: true })}\``
      });
      interaction.reply({ ephemeral: true, embeds: [embed] });
    } else {
      if (balance.claimNewUser) {
        if (Date.now() > balance.claimNewUser) {
          balance.claimNewUser = null;
        } else {
          const endTime = balance.claimNewUser;
          const nowInSecond = Math.round(endTime / 1000);

          const embed = new EmbedBuilder()
            .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({
              name: `**${this.client.user.username} - Claim**`,
              value: `**◎ Error:** Your Economy proifle is too new! Please wait another <t:${nowInSecond}:R> before using this command.`
            });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }
      }

      if (balance.hourly) {
        if (Date.now() > balance.hourly) {
          balance.hourly = null;
        }
      }

      if (balance.daily) {
        if (Date.now() > balance.daily) {
          balance.daily = null;
        }
      }

      if (balance.weekly) {
        if (Date.now() > balance.weekly) {
          balance.weekly = null;
        }
      }

      if (balance.monthly) {
        if (Date.now() > balance.monthly) {
          balance.monthly = null;
        }
      }

      if (Date.now() < balance.hourly && Date.now() < balance.daily && Date.now() < balance.weekly && Date.now() < balance.monthly) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Claim - All**`, value: '**◎ Error:** You have nothing to claim!' });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      let fullPrice = 0;

      if (!balance.hourly)
        fullPrice +=
          Math.floor(Math.random() * this.client.ecoPrices.hourlyClaim.max - this.client.ecoPrices.hourlyClaim.min + 1) +
          this.client.ecoPrices.hourlyClaim.min;
      if (!balance.daily)
        fullPrice +=
          Math.floor(Math.random() * this.client.ecoPrices.dailyClaim.max - this.client.ecoPrices.dailyClaim.min + 1) +
          this.client.ecoPrices.dailyClaim.min;
      if (!balance.weekly)
        fullPrice +=
          Math.floor(Math.random() * this.client.ecoPrices.weeklyClaim.max - this.client.ecoPrices.weeklyClaim.min + 1) +
          this.client.ecoPrices.weeklyClaim.min;
      if (!balance.monthly)
        fullPrice +=
          Math.floor(Math.random() * this.client.ecoPrices.monthlyClaim.max - this.client.ecoPrices.monthlyClaim.min + 1) +
          this.client.ecoPrices.monthlyClaim.min;

      const endTime = new Date().getTime();

      balance.hourly = !balance.hourly ? endTime + 3600000 : balance.hourly;
      balance.daily = !balance.daily ? endTime + 86400000 : balance.daily;
      balance.weekly = !balance.weekly ? endTime + 604800000 : balance.weekly;
      balance.monthly = !balance.monthly ? endTime + 2629800000 : balance.monthly;
      balance.bank += fullPrice;
      balance.total += fullPrice;

      await balance.save();

      const newTot = balance.total + fullPrice;

      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Claim - All**`,
          value: `**◎ Success:** You have claimed all available claims! <:coin:706659001164628008> \`${fullPrice.toLocaleString(
            'en'
          )}\` has been credited to your bank.\n Your new total is <:coin:706659001164628008> \`${newTot.toLocaleString('en')}\``
        });
      interaction.reply({ embeds: [embed] });
    }
  }
};

export default SlashCommandF;
