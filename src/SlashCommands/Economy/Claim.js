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
    const balance = await Balance.findOne({ IdJoined: `${interaction.user.id}-${interaction.guild.id}` });

    const type = interaction.options.getSubcommand();

    if (type === 'view') {
      const date = new Date();

      const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Claim**`,
        value: `**◎ Hourly:** \`${Date.now() > balance.Hourly ? 'Available!' : ms(balance.Hourly - date.getTime(), { long: true })}\`
				**◎ Daily:** \`${Date.now() > balance.Daily ? 'Available!' : ms(balance.Daily - date.getTime(), { long: true })}\`
				**◎ Weekly:** \`${Date.now() > balance.Weekly ? 'Available!' : ms(balance.Weekly - date.getTime(), { long: true })}\`
				**◎ Monthly:** \`${Date.now() > balance.Monthly ? 'Available!' : ms(balance.Monthly - date.getTime(), { long: true })}\``
      });
      interaction.reply({ ephemeral: true, embeds: [embed] });
    } else {
      if (balance.ClaimNewUser) {
        if (Date.now() > balance.ClaimNewUser) {
          balance.ClaimNewUser = null;
        } else {
          const endTime = balance.ClaimNewUser;
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

      if (balance.Hourly) {
        if (Date.now() > balance.Hourly) {
          balance.Hourly = null;
        }
      }

      if (balance.Daily) {
        if (Date.now() > balance.Daily) {
          balance.Daily = null;
        }
      }

      if (balance.Weekly) {
        if (Date.now() > balance.Weekly) {
          balance.Weekly = null;
        }
      }

      if (balance.Monthly) {
        if (Date.now() > balance.Monthly) {
          balance.Monthly = null;
        }
      }

      if (Date.now() < balance.Hourly && Date.now() < balance.Daily && Date.now() < balance.Weekly && Date.now() < balance.Monthly) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Claim - All**`, value: '**◎ Error:** You have nothing to claim!' });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      let fullPrice = 0;

      if (!balance.Hourly)
        fullPrice +=
          Math.floor(Math.random() * this.client.ecoPrices.HourlyClaim.max - this.client.ecoPrices.HourlyClaim.min + 1) +
          this.client.ecoPrices.HourlyClaim.min;
      if (!balance.Daily)
        fullPrice +=
          Math.floor(Math.random() * this.client.ecoPrices.DailyClaim.max - this.client.ecoPrices.DailyClaim.min + 1) +
          this.client.ecoPrices.DailyClaim.min;
      if (!balance.Weekly)
        fullPrice +=
          Math.floor(Math.random() * this.client.ecoPrices.WeeklyClaim.max - this.client.ecoPrices.WeeklyClaim.min + 1) +
          this.client.ecoPrices.WeeklyClaim.min;
      if (!balance.Monthly)
        fullPrice +=
          Math.floor(Math.random() * this.client.ecoPrices.MonthlyClaim.max - this.client.ecoPrices.MonthlyClaim.min + 1) +
          this.client.ecoPrices.MonthlyClaim.min;

      const endTime = new Date().getTime();

      balance.Hourly = !balance.Hourly ? endTime + 3600000 : balance.Hourly;
      balance.Daily = !balance.Daily ? endTime + 86400000 : balance.Daily;
      balance.Weekly = !balance.Weekly ? endTime + 604800000 : balance.Weekly;
      balance.Monthly = !balance.Monthly ? endTime + 2629800000 : balance.Monthly;
      balance.Bank += fullPrice;
      balance.Total += fullPrice;

      await balance.save();

      const newTot = balance.Total + fullPrice;

      const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Claim - All**`,
          value: `**◎ Success:** You have claimed all available claims! <:coin:706659001164628008> \`${fullPrice.toLocaleString(
            'en'
          )}\` has been credited to your Bank.\n Your new total is <:coin:706659001164628008> \`${newTot.toLocaleString('en')}\``
        });
      interaction.reply({ embeds: [embed] });
    }
  }
};

export default SlashCommandF;
