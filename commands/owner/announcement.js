const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const { ownerID } = require('../../storage/config.json');

module.exports = {
  config: {
    name: 'announcement',
    usage: '${prefix}announcement <msg>',
    category: 'Owner',
    description: 'Sets the message for stats command',
    accessableby: 'Owner',
  },
  run: async (bot, message, args) => {
    if (message.author.id !== ownerID) return;

    const prefixgrab = db
      .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
      .get(message.guild.id);
    const { prefix } = prefixgrab;

    if (args[0] === undefined) {
      const noArgs = new MessageEmbed()
        .setColor('36393F')
        .setDescription(
          `**Incorrect Usage! Please use:**:\n\n${prefix}announcement <message>`,
        );
      message.channel.send(noArgs);
      return;
    }

    db.prepare('UPDATE announcement SET msg = ?').run(args.join(' '));
    const complete = new MessageEmbed()
      .setColor('36393F')
      .setDescription(`**Success! Announcement message has been set to:**\n\`\`\`${args.join(' ')}\`\`\``);
    message.channel.send(complete);
  },
};
