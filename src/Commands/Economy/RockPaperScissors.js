/* eslint-disable default-case */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-expressions */
import { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } from 'discord.js';
import SQLite from 'better-sqlite3';
import Command from '../../Structures/Command.js';

const db = new SQLite('./Storage/DB/db.sqlite');

const comCooldown = new Set();
const comCooldownSeconds = 10;

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ['rps'],
      description: 'Play a game of Rock Paper Scissors!',
      category: 'Economy'
    });
  }

  async run(message, args) {
    const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
    const { prefix } = prefixgrab;

    const balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);

    if (!balance) {
      this.client.utils.messageDelete(message, 10000);

      const limitE = new EmbedBuilder()
        .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Coin Flip**`, value: '**◎ Error:** You do not have any balance!' });
      message.channel.send({ embeds: [limitE] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    if (!args[0]) {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Coin Flip**`, value: '**◎ Error:** Please input an amount you wish to bet.' });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    if (comCooldown.has(message.author.id)) {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Coin Flip**`, value: '**◎ Error:** You can only run one instance of this game!.' });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    let rps;

    Number.isNaN(args[0]) && args[0] === 'all' ? (rps = balance.bank) : (rps = args[0]);

    if (Number.isNaN(rps)) {
      this.client.utils.messageDelete(message, 10000);

      const wrongUsage = new EmbedBuilder()
        .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Coin Flip**`,
          value: `**◎ Error:** An example of this command is: \`${prefix}rps 100\`\nAlternatively, you can run \`${prefix}rps all\``
        });
      message.channel.send({ embeds: [wrongUsage] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    if (Number(rps) < 10) {
      this.client.utils.messageDelete(message, 10000);

      const wrongUsage = new EmbedBuilder()
        .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Coin Flip**`,
          value: '**◎ Error:** Please enter a value of at least <:coin:706659001164628008> `10`. Please try again with a valid amount.'
        });
      message.channel.send({ embeds: [wrongUsage] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    if (Number(rps) > balance.bank) {
      this.client.utils.messageDelete(message, 10000);

      const wrongUsage = new EmbedBuilder()
        .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Coin Flip**`,
          value: `**◎ Error:** You do not have enough to bet <:coin:706659001164628008> \`${Number(rps).toLocaleString(
            'en'
          )}\`, you have <:coin:706659001164628008> \`${Number(balance.bank).toLocaleString('en')}\` available in your bank.`
        });
      message.channel.send({ embeds: [wrongUsage] }).then((m) => this.client.utils.deletableCheck(m, 10000));
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

    const houseBet = Number(rps);

    const choices = ['rock', 'paper', 'scissors'];
    const index = Math.floor(Math.random() * 3);
    const ai = choices[index];

    const group1 = new ActionRowBuilder().addComponents([Rock, Paper, Scissors, Cancel]);

    const group2 = new ActionRowBuilder().addComponents([[RockNew, PaperNew, ScissorsNew, CancelNew]]);

    const initial = new EmbedBuilder()
      .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
      .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Rock Paper Scissors**`,
        value: `**◎** ${message.author} bet <:coin:706659001164628008> \`${Number(rps).toLocaleString('en')}\``
      });

    const win = new EmbedBuilder()
      .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
      .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Rock Paper Scissors**`,
        value: `**◎** ${message.author} won <:coin:706659001164628008> \`${houseBet.toLocaleString('en')}\` has been credited to your bank!`
      });

    const lose = new EmbedBuilder()
      .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
      .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Rock Paper Scissors**`,
        value: `**◎** ${message.author} lost <:coin:706659001164628008> \`${rps.toLocaleString('en')}\``
      });

    const tie = new EmbedBuilder()
      .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
      .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Rock Paper Scissors**`,
        value: `**◎** ${message.author} Tied! Your wager has been returned to your bank.`
      });

    const m = await message.channel.send({ components: [group1], embeds: [initial] });
    const filter = (but) => but.user.id === message.author.id;

    const collector = m.createMessageComponentCollector({ filter, time: 30000 });

    if (!comCooldown.has(message.author.id)) {
      comCooldown.add(message.author.id);
    }
    setTimeout(() => {
      if (comCooldown.has(message.author.id)) {
        comCooldown.delete(message.author.id);
      }
    }, comCooldownSeconds * 1000);

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
      if (comCooldown.has(message.author.id)) {
        comCooldown.delete(message.author.id);
      }

      if (reason === 'win') {
        balance.bank += houseBet;
        balance.total += houseBet;
        this.client.setBalance.run(balance);
      }
      if (reason === 'lose') {
        balance.bank -= rps;
        balance.total -= rps;
        this.client.setBalance.run(balance);
      }

      if (reason === 'cancel' || reason === 'time') {
        await this.client.utils.messageDelete(message, 0);
        await this.client.utils.messageDelete(m, 0);

        const limitE = new EmbedBuilder()
          .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({
            name: `**${this.client.user.username} - Coin Flip**`,
            value: '**◎ Success:** Your bet was cancelled, your money has been returned.'
          });
        message.channel.send({ embeds: [limitE] }).then((ca) => this.client.utils.deletableCheck(ca, 10000));
      }
    });
  }
};

export default CommandF;
