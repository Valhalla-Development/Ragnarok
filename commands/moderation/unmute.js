const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const { ownerID } = require('../../storage/config.json');
const db = new SQLite('./storage/db/db.sqlite');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'unmute',
    usage: '${prefix}unmute <@user>',
    category: 'moderation',
    description: 'Unutes a user in the guild',
    accessableby: 'Staff',
  },
  run: async (bot, message, args) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    if (message.member.guild.me.hasPermission('MANAGE_MESSAGES')) {
      message.delete();
    }

    if (
      !message.member.hasPermission('KICK_MEMBERS') && message.author.id !== ownerID) {
      message.channel
        .send(`${language.unmute.noAuthorPermission}`)
        .then((message) => message.delete({
          timeout: 5000,
        }));
      return;
    }

    const mod = message.author;
    const user = message.guild.member(
      message.mentions.users.first() || message.guild.members.cache.get(args[0]),
    );
    if (!user) {
      return message.reply(`${language.unmute.noMention}`).then((message) => message.delete({
        timeout: 5000,
      }));
    }
    const muterole = message.guild.roles.cache.find((x) => x.name === 'Muted');
    if (!user.roles.cache.find((x) => x.id === muterole.id)) { return message.channel.send(`${language.unmute.noRoleAsigned}`); }

    const dbid = db
      .prepare(
        `SELECT channel FROM logging WHERE guildid = ${message.guild.id};`,
      )
      .get();
    if (!dbid) {
      await user.roles.remove(muterole.id);
      const unmuteembed = new MessageEmbed()
        .setAuthor(' Action | Un-Mute', message.guild.iconURL())
        .addFields({ name: 'User', value: `<@${user.id}>` },
          { name: 'Staff Member', value: `${mod}` })
        .setColor('#ff0000');
      message.channel.send(unmuteembed);
    } else {
      const dblogs = dbid.channel;
      await user.roles.remove(muterole.id);
      const unmuteembed = new MessageEmbed()
        .setAuthor(' Action | Un-Mute', message.guild.iconURL())
        .addFields({ name: 'User', value: `<@${user.id}>` },
          { name: 'Staff Member', value: `${mod}` })
        .setColor('#ff0000');
      bot.channels.cache.get(dblogs).send(unmuteembed);
      message.channel.send(unmuteembed);
    }
  },
};
