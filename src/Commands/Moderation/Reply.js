/* eslint-disable consistent-return */
import { EmbedBuilder } from 'discord.js';
import SQLite from 'better-sqlite3';
import Command from '../../Structures/Command.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ['sayreply'],
      description: 'Reply to a message as the bot.',
      category: 'Moderation',
      usage: '<channel id> <message id> <text>',
      userPerms: ['ManageGuild']
    });
  }

  async run(message, args) {
    const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
    const { prefix } = prefixgrab;

    this.client.utils.messageDelete(message, 0);

    if (args[0] === undefined) {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Reply**`,
        value: `**◎ Error:** Incorrect Usage, examples follow:\n\n\`${prefix}reply <channel id> <message id> <text>\`\n\`${prefix}reply <message link> <text>\``
      });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    if (returnValuesFromLink()) {
      if (args[1] === undefined) {
        this.client.utils.messageDelete(message, 10000);

        const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Reply**`,
          value: '**◎ Error:** You need to input text you wish to reply with!'
        });
        message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }

      if (returnValuesFromLink().guildID !== message.guild.id) {
        this.client.utils.messageDelete(message, 10000);

        const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Reply**`,
          value: '**◎ Error:** I can not find the message you linked within this server.'
        });
        message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }

      const fetchChannel = message.guild.channels.cache.get(returnValuesFromLink().channelID);

      fetchChannel.messages
        .fetch({ message: returnValuesFromLink().messageID })
        .then(async (msg) => {
          msg.reply({ content: `${args.slice(1).join(' ')}` });
        })
        .catch(() => {
          this.client.utils.messageDelete(message, 10000);

          const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Reply**`,
            value: '**◎ Error:** An error occured while trying to reply to the message!\nHas the message been deleted?'
          });
          message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        });
      return;
    }

    if (args[1] === undefined) {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Reply**`, value: '**◎ Error:** You need to input a message ID' });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    if (args[2] === undefined) {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Reply**`, value: '**◎ Error:** You need to input text you wish to reply with!' });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    const channel = message.guild.channels.cache.get(args[0]);

    if (!channel) {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Reply**`, value: '**◎ Error:** I was unable to find the specified channel!' });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    channel.messages
      .fetch({ message: args[1] })
      .then(async (msg) => {
        msg.reply({ content: `${args.slice(2).join(' ')}` });
      })
      .catch(() => {
        this.client.utils.messageDelete(message, 10000);

        const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Reply**`,
          value: '**◎ Error:** An error occured while trying to reply to the message!\nHas the message been deleted?'
        });
        message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      });

    function returnValuesFromLink() {
      const mainReg = /https:\/\/discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/;
      const ptbReg = /https:\/\/ptb\.discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/;
      const disReg = /https:\/\/discord\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/;
      const ptReg = /https:\/\/ptb\.discord\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/;
      const caReg = /https:\/\/canary\.discord\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/;
      const canApReg = /https:\/\/canary\.discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/;

      const mainCheck = mainReg.test(args[0].toLowerCase());
      const ptbCheck = ptbReg.test(args[0].toLowerCase());
      const disCheck = disReg.test(args[0].toLowerCase());
      const ptbdisCheck = ptReg.test(args[0].toLowerCase());
      const canCheck = caReg.test(args[0].toLowerCase());
      const canACheck = canApReg.test(args[0].toLowerCase());

      const exec =
        mainReg.exec(args[0].toLowerCase()) ||
        ptbReg.exec(args[0].toLowerCase()) ||
        disReg.exec(args[0].toLowerCase()) ||
        ptReg.exec(args[0].toLowerCase()) ||
        caReg.exec(args[0].toLowerCase()) ||
        canApReg.exec(args[0].toLowerCase());

      let guildID;
      let channelID;
      let messageID;

      if (mainCheck || ptbCheck || disCheck || ptbdisCheck || canCheck || canACheck) {
        const mainGlob = /https:\/\/discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/g;
        const ptbGlob = /https:\/\/ptb\.discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/g;
        const disGlob = /https:\/\/discord\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/g;
        const ptGlob = /https:\/\/ptb\.discord\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/g;
        const caGlob = /https:\/\/canary\.discord\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/g;
        const canAGlob = /https:\/\/canary\.discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,18}/g;

        let lengthMain;
        let lengthPtb;

        if (mainGlob.test(args[0].toLowerCase()) === true) {
          lengthMain = args[0].toLowerCase().match(mainGlob).length;
        } else {
          lengthMain = 0;
        }
        if (ptbGlob.test(args[0].toLowerCase()) === true) {
          lengthPtb = args[0].toLowerCase().match(ptbGlob).length;
        } else {
          lengthPtb = 0;
        }
        if (disGlob.test(args[0].toLowerCase()) === true) {
          lengthMain = args[0].toLowerCase().match(disGlob).length;
        } else {
          lengthMain = 0;
        }
        if (ptGlob.test(args[0].toLowerCase()) === true) {
          lengthPtb = args[0].toLowerCase().match(ptGlob).length;
        } else {
          lengthPtb = 0;
        }
        if (caGlob.test(args[0].toLowerCase()) === true) {
          lengthMain = args[0].toLowerCase().match(caGlob).length;
        } else {
          lengthMain = 0;
        }
        if (canAGlob.test(args[0].toLowerCase()) === true) {
          lengthPtb = args[0].toLowerCase().match(canAGlob).length;
        } else {
          lengthPtb = 0;
        }

        if (lengthMain + lengthPtb > 1) return;

        const mesLink = exec[0];
        if (mainCheck) {
          guildID = mesLink.substring(32, mesLink.length - 38);
          channelID = mesLink.substring(51, mesLink.length - 19);
          messageID = mesLink.substring(70);
        } else if (ptbCheck) {
          guildID = mesLink.substring(36, mesLink.length - 38);
          channelID = mesLink.substring(55, mesLink.length - 19);
          messageID = mesLink.substring(74);
        } else if (disCheck) {
          guildID = mesLink.substring(29, mesLink.length - 38);
          channelID = mesLink.substring(48, mesLink.length - 19);
          messageID = mesLink.substring(67);
        } else if (ptbdisCheck) {
          guildID = mesLink.substring(33, mesLink.length - 38);
          channelID = mesLink.substring(52, mesLink.length - 19);
          messageID = mesLink.substring(71);
        } else if (canCheck) {
          guildID = mesLink.substring(36, mesLink.length - 38);
          channelID = mesLink.substring(55, mesLink.length - 19);
          messageID = mesLink.substring(74);
        } else if (canACheck) {
          guildID = mesLink.substring(39, mesLink.length - 38);
          channelID = mesLink.substring(58, mesLink.length - 19);
          messageID = mesLink.substring(77);
        }

        let data;

        if (guildID && channelID && messageID) {
          data = {
            guildID,
            channelID,
            messageID
          };
          return data;
        }
        return false;
      }
    }
  }
};

export default CommandF;
