const { MessageEmbed } = require('discord.js');
const ms = require('ms');
const SQLite = require('better-sqlite3');
const { ownerID } = require('../../storage/config.json');
const db = new SQLite('./storage/db/db.sqlite');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'mute',
    usage: '${prefix}mute <@user> <time> <reason>',
    category: 'moderation',
    description: 'Mutes a user in the guild',
    accessableby: 'Staff',
  },
  run: async (bot, message, args) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS') || (!message.member.guild.me.hasPermission('MANAGE_ROLES'))) {
      message.channel.send('I need the permissions `Embed Links` and `MANAGE_ROLES` for this command!');
      return;
    }

    const prefixgrab = db
      .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
      .get(message.guild.id);
    const { prefix } = prefixgrab;


    if (
      !message.member.hasPermission('KICK_MEMBERS') && message.author.id !== ownerID) {
      message.channel
        .send(`${language.mute.noAuthorPermission}`)
        .then((message) => message.delete({
          timeout: 5000,
        }));
      return;
    }

    const mod = message.author;
    const user = message.guild.member(
      message.mentions.users.first() || message.guild.members.cache.get(args[0]),
    );
    const noUserMessage = language.mute.noUser;
    const noUserConvert = noUserMessage.replace('${prefix}', prefix);
    if (!user) {
      return message.reply(`${noUserConvert}`).then((message) => message.delete({
        timeout: 5000,
      }));
    }
    const reason = message.content
      .split(' ')
      .splice(3)
      .join(' ');
    if (!reason) {
      return message.channel.send(`${language.mute.noReason}`).then((message) => message.delete({
        timeout: 5000,
      }));
    }
    const muterole = message.guild.roles.cache.find((x) => x.name === 'Muted');
    if (!muterole) return message.channel.send('I could not find the mute role! Please create it, it must be named `Muted`');

    const mutetime = args[1];
    if (!mutetime) {
      return message.channel.send(`${language.mute.noTime}`).then((message) => message.delete({
        timeout: 5000,
      }));
    }

    if (user.roles.cache.has(muterole.id)) {
      const alreadymuted = new MessageEmbed()
        .setColor('36393F')
        .setDescription(':x: This user is already muted!');
      message.channel.send(alreadymuted);
      return;
    }

    const dbid = db
      .prepare(
        `SELECT channel FROM logging WHERE guildid = ${message.guild.id};`,
      )
      .get();
    if (!dbid) {
      await user.roles.add(muterole.id);
      const muteembed = new MessageEmbed()
        .setAuthor(
          ' Action | Mute',
          'https://images-ext-2.discordapp.net/external/Wms63jAyNOxNHtfUpS1EpRAQer2UT0nOsFaWlnDdR3M/https/image.flaticon.com/icons/png/128/148/148757.png',
        )
        .addFields({ name: 'User', value: `<@${user.id}>` },
          { name: 'Reason', value: `${reason}` },
          { name: 'Time', value: `${mutetime}` },
          { name: 'Moderator', value: `${mod}` })
        .setColor('36393F');
      message.channel.send(muteembed);

      setTimeout(() => {
        user.roles.remove(muterole.id);
        const unmuteembed = new MessageEmbed()
          .setAuthor(' Action | Un-Mute', message.guild.iconURL())
          .addFields({ name: 'User', value: `<@${user.id}>` },
            { name: 'Reason', value: 'Mute time ended' })
          .setColor('36393F');

        message.channel.send(unmuteembed);
      }, ms(mutetime));
    } else {
      const dblogs = dbid.channel;
      await user.roles.add(muterole.id);
      const muteembed = new MessageEmbed()
        .setAuthor(
          ' Action | Mute',
          'https://images-ext-2.discordapp.net/external/Wms63jAyNOxNHtfUpS1EpRAQer2UT0nOsFaWlnDdR3M/https/image.flaticon.com/icons/png/128/148/148757.png',
        )
        .addFields({ name: 'User', value: `<@${user.id}>` },
          { name: 'Reason', value: `${reason}` },
          { name: 'Time', value: `${mutetime}` },
          { name: 'Moderator', value: `${mod}` })
        .setColor('36393F');
      bot.channels.cache.get(dblogs).send(muteembed);
      message.channel.send(muteembed);

      setTimeout(() => {
        user.roles.remove(muterole.id);
        const unmuteembed = new MessageEmbed()
          .setAuthor(' Action | Un-Mute', message.guild.iconURL())
          .addFields({ name: 'User', value: `<@${user.id}>` },
            { name: 'Reason', value: 'Mute time ended' })
          .setColor('36393F');

        bot.channels.cache.get(dblogs).send(unmuteembed);
        message.channel.send(unmuteembed);
      }, ms(mutetime));
    }
  },
};
