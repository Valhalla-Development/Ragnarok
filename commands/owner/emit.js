const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const { ownerID } = require('../../storage/config.json');

module.exports = {
  config: {
    name: 'emit',
    usage: '${prefix}emit',
    category: 'Owner',
    description: 'Emits an event',
    accessableby: 'Owner',
  },
  run: async (bot, message, args) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    if (message.author.id !== ownerID) return;

    const prefixgrab = db
      .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
      .get(message.guild.id);
    const { prefix } = prefixgrab;

    if (args[0] === undefined) {
      const noArgs = new MessageEmbed()
        .setColor('36393F')
        .setDescription(
          `**Available Commands**:\n\n${prefix}emit guildMemberAdd\n${prefix}emit guildMemberRemove`,
        );
      message.channel.send(noArgs);
    }
    if (args[0] === 'guildMemberAdd') {
      bot.emit('guildMemberAdd', message.member);
      return;
    }
    if (args[0] === 'guildMemberRemove') {
      bot.emit('guildMemberRemove', message.member);
      return;
    }
  },
};
