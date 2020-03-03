const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
  config: {
    name: 'music',
    usage: '${prefix}music',
    category: 'music',
    description: 'Displays available Music commands',
    accessableby: 'Everyone',
  },
  run: async (bot, message, args) => {
    const prefixgrab = db
      .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
      .get(message.guild.id);
    const { prefix } = prefixgrab;

    if (args[0] === undefined) {
      const embed = new MessageEmbed()
        .setColor(0xcf40fa)
        .addFields({ name: 'Music Commands', value: `[${prefix}play]() <search term/link> : Plays music\n[${prefix}pause]() : Pauses music playback\n[${prefix}resume]() : Resumes music playback\n[${prefix}nowplaying]() : Displays current song being playedn[${prefix}queue]() : Displays current song queue` });
      message.channel.send({
        embed,
      });
    }
  },
};
