/* eslint-disable prefer-destructuring */
/* eslint-disable default-case */
/* eslint-disable no-unused-expressions */
import { EmbedBuilder, SlashCommandBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } from 'discord.js';
import SlashCommand from '../../Structures/SlashCommand.js';
import Balance from '../../Mongo/Schemas/Balance.js';

const data = new SlashCommandBuilder()
  .setName('rockpaperscissors')
  .setDescription('Play a game of Rock Paper Scissors!')
  .addIntegerOption((option) => option.setName('amount').setDescription('Amount to bet').setMinValue(10).setRequired(true));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Play a game of Rock Paper Scissors!',
      category: 'Economy',
      options: data
    });
  }

  async run(interaction) {
    const amt = interaction.options.getInteger('amount');

    const balance = await Balance.findOne({ IdJoined: `${interaction.user.id}-${interaction.guild.id}` });

    if (!balance) {
      const limitE = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Coin Flip**`, value: '**◎ Error:** You do not have any balance!' });
      interaction.reply({ ephemeral: true, embeds: [limitE] });
      return;
    }

    if (Number(amt) > balance.Bank) {
      const wrongUsage = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Coin Flip**`,
          value: `**◎ Error:** You do not have enough to bet <:coin:706659001164628008> \`${Number(amt).toLocaleString(
            'en'
          )}\`, you have <:coin:706659001164628008> \`${Number(balance.Bank).toLocaleString('en')}\` available in your Bank.`
        });
      interaction.reply({ ephemeral: true, embeds: [wrongUsage] });
      return;
    }

    const Rock = new ButtonBuilder().setStyle(ButtonStyle.Primary).setEmoji('🪨').setLabel('Rock').setCustomId('rock');
    const Paper = new ButtonBuilder().setStyle(ButtonStyle.Primary).setEmoji('🧻').setLabel('Paper').setCustomId('paper');
    const Scissors = new ButtonBuilder().setStyle(ButtonStyle.Primary).setEmoji('✂️').setLabel('Scissors').setCustomId('scissors');
    const Cancel = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Cancel').setCustomId('cancel');
    const RockNew = new ButtonBuilder().setStyle(ButtonStyle.Primary).setEmoji('🪨').setLabel('Rock').setCustomId('rock').setDisabled(true);
    const PaperNew = new ButtonBuilder().setStyle(ButtonStyle.Primary).setEmoji('🧻').setLabel('Paper').setCustomId('paper').setDisabled(true);

    const ScissorsNew = new ButtonBuilder()
      .setStyle(ButtonStyle.Primary)
      .setEmoji('✂️')
      .setLabel('Scissors')
      .setCustomId('scissors')
      .setDisabled(true);

    const CancelNew = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Cancel').setCustomId('cancel').setDisabled(true);

    const houseBet = Number(amt);

    const choices = ['rock', 'paper', 'scissors'];
    const index = Math.floor(Math.random() * 3);
    const ai = choices[index];

    const group1 = new ActionRowBuilder().addComponents([Rock, Paper, Scissors, Cancel]);

    const group2 = new ActionRowBuilder().addComponents([RockNew, PaperNew, ScissorsNew, CancelNew]);

    const initial = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Rock Paper Scissors**`,
        value: `**◎** ${interaction.user} bet <:coin:706659001164628008> \`${Number(amt).toLocaleString('en')}\``
      });

    const win = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Rock Paper Scissors**`,
        value: `**◎** ${interaction.user} won <:coin:706659001164628008> \`${houseBet.toLocaleString('en')}\` has been credited to your Bank!`
      });

    const lose = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Rock Paper Scissors**`,
        value: `**◎** ${interaction.user} lost <:coin:706659001164628008> \`${amt.toLocaleString('en')}\``
      });

    const tie = new EmbedBuilder()
      .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Rock Paper Scissors**`,
        value: `**◎** ${interaction.user} Tied! Your wager has been returned to your Bank.`
      });

    const m = await interaction.reply({ components: [group1], embeds: [initial] });
    const filter = (but) => but.user.id === interaction.user.id;

    const collector = m.createMessageComponentCollector({ filter, time: 30000 });

    collector.on('collect', async (button) => {
      if (button.customId === 'cancel') {
        collector.stop('cancel');
      }

      switch (ai) {
        case 'rock':
          if (button.customId === 'rock') {
            button.update({ components: [group2], embeds: [tie] });
            collector.stop('tie');
          }
          if (button.customId === 'paper') {
            button.update({ components: [group2], embeds: [win] });
            collector.stop('win');
          }
          if (button.customId === 'scissors') {
            button.update({ components: [group2], embeds: [lose] });
            collector.stop('lose');
          }
          break;
        case 'paper':
          if (button.customId === 'rock') {
            button.update({ components: [group2], embeds: [lose] });
            collector.stop('lose');
          }
          if (button.customId === 'paper') {
            button.update({ components: [group2], embeds: [tie] });
            collector.stop('tie');
          }
          if (button.customId === 'scissors') {
            button.update({ components: [group2], embeds: [win] });
            collector.stop('win');
          }
          collector.stop('gameEnd');
          break;
        case 'scissors':
          if (button.customId === 'rock') {
            button.update({ components: [group2], embeds: [win] });
            collector.stop('win');
          }
          if (button.customId === 'paper') {
            button.update({ components: [group2], embeds: [lose] });
            collector.stop('lose');
          }
          if (button.customId === 'scissors') {
            button.update({ components: [group2], embeds: [tie] });
            collector.stop('tie');
          }
          collector.stop('gameEnd');
          break;
      }
    });
    collector.on('end', async (_, reason) => {
      if (reason === 'win') {
        balance.Bank += houseBet;
        balance.Total += houseBet;
        await balance.save();
      }
      if (reason === 'lose') {
        balance.Bank -= amt;
        balance.Total -= amt;
        await balance.save();
      }

      if (reason === 'cancel' || reason === 'time') {
        await interaction.deleteReply();
      }
    });
  }
};

export default SlashCommandF;
