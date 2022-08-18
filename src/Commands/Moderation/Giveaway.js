import ms from 'ms';
import SQLite from 'better-sqlite3';
import { EmbedBuilder } from 'discord.js';
import Command from '../../Structures/Command.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ['g'],
      description: 'Starts a giveaway.',
      category: 'Moderation',
      usage: '<start/stop/reroll> <time> <winners amount> <prize>',
      userPerms: ['ManageMessages'],
      botPerms: ['AddReactions']
    });
  }

  async run(message, args) {
    const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
    const { prefix } = prefixgrab;

    const usageE = new EmbedBuilder()
      .setThumbnail(this.client.user.displayAvatarURL())
      .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
      .addFields({
        name: `**${this.client.user.username} - Giveaway**`,
        value: `**◎ Start:** \`${prefix}giveaway start <time> <winners amount> <prize>\`
				**◎ Reroll:** \`${prefix}giveaway reroll <message id>\`
				**◎ Stop:** \`${prefix}giveaway stop <message id>\``
      })
      .setTimestamp();

    if (!args[0]) {
      this.client.utils.messageDelete(message, 10000);

      message.channel.send({ embeds: [usageE] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }
    if (args[0] !== 'start' && args[0] !== 'reroll' && args[0] !== 'stop') {
      this.client.utils.messageDelete(message, 10000);

      message.channel.send({ embeds: [usageE] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    if (args[0] === 'start') {
      if (!args[1] || !args[2] || !args[3]) {
        this.client.utils.messageDelete(message, 10000);

        const incorrectStart = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Giveaway**`,
          value: `**◎ Error:** \`${prefix}giveaway start <time> <winners amount> <prize>\``
        });
        message.channel.send({ embeds: [incorrectStart] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }
      if (!args[1].match('[dhm]')) {
        this.client.utils.messageDelete(message, 10000);

        const incorrectFormat = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Giveaway**`,
          value: '**◎ Error:** You did not use the correct formatting for the time! The valid options are `d`, `h`, or `m`'
        });
        message.channel.send({ embeds: [incorrectFormat] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }
      if (ms(args[1]) > '7889400000') {
        this.client.utils.messageDelete(message, 10000);

        const valueHigh = new EmbedBuilder()
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: '**◎ Error:** Please input a value lower than 3 months!' });
        message.channel.send({ embeds: [valueHigh] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }
      if (ms(args[1]) < '60000') {
        this.client.utils.messageDelete(message, 10000);

        const valueLow = new EmbedBuilder()
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: '**◎ Error:** Please input a value higher than 1 minute!' });
        message.channel.send({ embeds: [valueLow] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }
      if (Number.isNaN(ms(args[1]))) {
        this.client.utils.messageDelete(message, 10000);

        const invalidDur = new EmbedBuilder()
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: '**◎ Error:** Please input a valid duration!' });
        message.channel.send({ embeds: [invalidDur] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }
      if (Number.isNaN(args[2]) || parseInt(args[2]) <= 0) {
        this.client.utils.messageDelete(message, 10000);

        const invalidNum = new EmbedBuilder()
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: '**◎ Error:** Please input a valid number!' });
        message.channel.send({ embeds: [invalidNum] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }

      const duration = ms(args[1]);
      const winnerCount = parseInt(args[2]);
      const prize = args.slice(3).join(' ');

      this.client.giveawaysManager.start(message.channel, {
        duration,
        winnerCount,
        prize,
        lastChance: {
          enabled: true,
          content: '⚠️ **LAST CHANCE TO ENTER !** ⚠️',
          threshold: 5000,
          embedColor: '#FF0000'
        }
      });
    }

    if (args[0] === 'reroll') {
      this.client.utils.messageDelete(message, 10000);

      if (!args[1]) {
        const incorrectReroll = new EmbedBuilder()
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: `**◎ Error:** \`${prefix}giveaway reroll <message id>\`` });
        message.channel.send({ embeds: [incorrectReroll] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }
      const giveaway = this.client.giveawaysManager.giveaways.find((g) => g.guildId === message.guildId && g.messageId === args[0]);

      if (!giveaway) {
        this.client.utils.messageDelete(message, 10000);

        const noGiveaway = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Giveaway**`,
          value: `**◎ Error:** Unable to find a giveaway with ID: \`${args.slice(1).join(' ')}\`.`
        });
        message.channel.send({ embeds: [noGiveaway] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }
      this.client.giveawaysManager
        .reroll(giveaway.messageID)
        .then(() => {
          const rerolled = new EmbedBuilder()
            .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: '**◎ Success:** Giveaway rerolled!' });
          message.channel.send({ embeds: [rerolled] });
        })
        .catch((e) => {
          this.client.utils.messageDelete(message, 10000);

          if (e.startsWith(`Giveaway with message ID ${giveaway.messageID} is not ended.`)) {
            const notEnded = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: '**◎ Error:** This giveaway has not ended!' });
            message.channel.send({ embeds: [notEnded] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          } else {
            this.client.utils.messageDelete(message, 10000);

            console.error(e);
            const error = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: '**◎ Error:** An error occured!' });
            message.channel.send({ embeds: [error] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          }
        });
    }

    if (args[0] === 'stop') {
      if (!args[1]) {
        this.client.utils.messageDelete(message, 10000);

        const incorrectStop = new EmbedBuilder()
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: `**◎ Error:** \`${prefix}giveaway stop <message id>\`` });
        message.channel.send({ embeds: [incorrectStop] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }
      const giveaway = this.client.giveawaysManager.giveaways.find((g) => g.guildId === message.guildId && g.messageId === args[0]);

      if (!giveaway) {
        this.client.utils.messageDelete(message, 10000);

        const noGiveaway = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Giveaway**`,
          value: `**◎ Error:** Unable to find a giveaway with ID: \`${args.slice(1).join(' ')}\`.`
        });
        message.channel.send({ embeds: [noGiveaway] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }
      this.client.giveawaysManager
        .edit(giveaway.messageID, {
          setEndTimestamp: Date.now()
        })
        .then(() => {
          this.client.utils.messageDelete(message, 10000);

          const stopped = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Giveaway**`,
            value: `**◎ Success:** Giveaway will end in less than ${this.client.giveawaysManager.options.updateCountdownEvery / 1000} seconds.`
          });
          message.channel.send({ embeds: [stopped] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        })
        .catch((e) => {
          this.client.utils.messageDelete(message, 10000);

          if (e.startsWith(`Giveaway with message ID ${giveaway.messageID} is already ended.`)) {
            const alreadyEnded = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: '**◎ Error:** This giveaway has already ended!' });
            message.channel.send({ embeds: [alreadyEnded] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          } else {
            this.client.utils.messageDelete(message, 10000);

            console.error(e);
            const error = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Giveaway**`, value: '**◎ Error:** An error occured!' });
            message.channel.send({ embeds: [error] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          }
        });
    }
  }
};

export default CommandF;
