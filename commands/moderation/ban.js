const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const { ownerID } = require('../../storage/config.json');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'ban',
    usage: '${prefix}ban',
    category: 'moderation',
    description: 'Bans a user from the guild',
    accessableby: 'Staff',
  },
  run: async (bot, message, args, color) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    if (
      !message.member.hasPermission('BAN_MEMBERS') && message.author.id !== ownerID) {
      message.channel.send(`${language.ban.noAuthorPermission}`).then((msg) => {
        msg.delete({
          timeout: 10000,
        });
      });
      return;
    }

    const id = db
      .prepare(
        `SELECT channel FROM logging WHERE guildid = ${message.guild.id};`,
      )
      .get();
    if (!id) {
      const user = message.guild.member(
        message.mentions.users.first() || message.guild.members.cache.get(args[0]),
      );
      if (!user) {
        return message.reply(`${language.ban.notarget}`).then((msg) => msg.delete({
          timeout: 5000,
        }));
      }

      let reason = args.slice(1).join(' ');
      if (!reason) reason = 'No reason given';

      message.guild.member(user).ban(reason);

      const logsEmbed = new MessageEmbed()
        .setTitle('User Banned')
        .setFooter('User Ban Logs')
        .setColor(color)
        .setTimestamp()
        .addFields({ name: 'Banned User:', value: `${user}, ID: ${user.id}` },
          { name: 'Reason:', value: reason },
          { name: 'Moderator:', value: `${message.author}, ID: ${message.author.id}` },
          { name: 'Time:', value: message.createdAt });

      message.channel.send(logsEmbed);
    } else {
      const logch = id.channel;
      const logsch = bot.channels.cache.get(logch);

      const chuser = message.guild.member(
        message.mentions.users.first() || message.guild.members.cache.get(args[0]),
      );
      if (!chuser) {
        return message.reply(`${language.ban.notarget}`).then((message) => message.delete({
          timeout: 5000,
        }));
      }

      let chreason = args.slice(1).join(' ');
      if (!chreason) {
        chreason = 'None given';
      }

      message.guild.members.ban(chuser, { reason: `${chreason}` });
      message.channel
        .send(
          `${chuser}, was banned by ${
            message.author
          }\nCheck ${logsch} for more information!`,
        )
        .then(
          message.delete({
            timeout: 5000,
          }),
        );

      const logsEmbedD = new MessageEmbed()
        .setTitle('User Banned')
        .setFooter('User Ban Logs')
        .setColor(color)
        .setTimestamp()
        .addFields({ name: 'Banned User:', value: `${chuser}, ID: ${chuser.id}` },
          { name: 'Reason:', value: chreason },
          { name: 'Moderator:', value: `${message.author}, ID: ${message.author.id}` },
          { name: 'Time:', value: message.createdAt });

      logsch.send(logsEmbedD);
    }
  },
};
