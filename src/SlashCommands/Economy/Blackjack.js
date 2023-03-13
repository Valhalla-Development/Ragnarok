/* eslint-disable default-case */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-expressions */
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import blackjack from 'custom-bj';
import SlashCommand from '../../Structures/SlashCommand.js';
import Balance from '../../Mongo/Schemas/Balance.js';

const data = new SlashCommandBuilder()
  .setName('blackjack')
  .setDescription('Play a game of blackjack')
  .addSubcommand((subcommand) => subcommand.setName('all').setDescription('Bet your entire balance'))
  .addSubcommand((subcommand) =>
    subcommand
      .setName('amount')
      .setDescription('The amount to gamble')
      .addIntegerOption((option) => option.setName('amount').setDescription('The amount to gamble').setMinValue(10).setRequired(true))
  );

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Play a game of blackjack',
      category: 'Economy',
      options: data
    });
  }

  async run(interaction) {
    const subOptions = interaction.options.getSubcommand();

    const balance = await Balance.findOne({ IdJoined: `${interaction.user.id}-${interaction.guild.id}` });

    let betAmt;

    if (subOptions === 'all') {
      betAmt = balance.Bank;
    } else if (subOptions === 'amount') {
      betAmt = interaction.options.getInteger('amount');
    }

    if (Number(betAmt) > balance.Bank) {
      const wrongUsage = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - BlackJack**`,
          value: `**◎ Error:** You do not have enough to bet <:coin:706659001164628008> \`${Number(betAmt).toLocaleString(
            'en'
          )}\`, you have <:coin:706659001164628008> \`${Number(balance.Bank).toLocaleString('en')}\` available in your Bank.`
        });
      interaction.reply({ embeds: [wrongUsage] });
      return;
    }

    const houseBet = betAmt;

    const game = await blackjack(interaction, {
      resultEmbed: true,
      buttons: true,
      transition: 'edit',
      split: 'false',
      doubledown: 'false',
      betAmt
    });

    switch (game.result) {
      case 'WIN':
        balance.Bank += Number(houseBet);
        balance.Total += Number(houseBet);
        await balance.save();
        break;
      case 'LOSE':
        balance.Bank -= Number(betAmt);
        balance.Total -= Number(betAmt);
        await balance.save();
        break;

      case 'TIE':
        break;
      case 'CANCEL':
        break;
      case 'TIMEOUT':
        break;
    }
  }
};

export default SlashCommandF;
