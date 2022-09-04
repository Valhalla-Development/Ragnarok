import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';

const data = new SlashCommandBuilder()
  .setName('withdraw')
  .setDescription('Withdraws specified amount from your bank')
  .addIntegerOption((option) => option.setName('amount').setDescription('Amount to withdraw').setMinValue(1).setRequired(true));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Withdraws specified amount from your bank',
      category: 'Economy',
      options: data
    });
  }

  async run(interaction) {
    const balance = this.client.getBalance.get(`${interaction.user.id}-${interaction.guild.id}`);

    const numberCov = interaction.options.getInteger('amount');

    if (balance.bank === 0) {
      const noBalance = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Withdraw**`, value: '**◎ Error:** You currently have no money in your bank!' });
      interaction.reply({ ephemeral: true, embeds: [noBalance] });
      return;
    }

    if (numberCov > balance.bank) {
      const wrongUsage = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Withdraw**`,
          value: `**◎ Error:** You only have <:coin:706659001164628008> \`${balance.bank.toLocaleString(
            'en'
          )}\`. Please try again with a valid amount.`
        });
      interaction.reply({ ephemeral: true, embeds: [wrongUsage] });
      return;
    }

    const cashA = balance.cash + numberCov;
    const bankA = balance.bank - numberCov;
    const totaA = balance.total;

    balance.cash = cashA;
    balance.bank = bankA;
    balance.total = totaA;
    this.client.setBalance.run(balance);

    const depAll = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Withdraw**`,
        value: `**◎ Success:** You have withdrawn <:coin:706659001164628008> \`${numberCov.toLocaleString('en')}\`.`
      });
    interaction.reply({ ephemeral: true, embeds: [depAll] });
  }
};

export default SlashCommandF;
