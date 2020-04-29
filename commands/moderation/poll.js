const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const { ownerID } = require('../../storage/config.json');
const db = new SQLite('./storage/db/db.sqlite');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'poll',
    usage: '${prefix}poll <question>',
    category: 'moderation',
    description: 'Mutes a user in the guild',
    accessableby: 'Staff',
  },
  run: async (bot, message, args) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    const prefixgrab = db
      .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
      .get(message.guild.id);
    const { prefix } = prefixgrab;

    if (
      !message.member.hasPermission('MANAGE_GUILD') && message.author.id !== ownerID) {
      message.channel.send(`${language.poll.noPermission}`);
      return;
    }

    // Check for input
    if (!args[0]) {
      const incorrectUsageMessage = language.poll.incorrectUsage;
      const incorrectUsage = incorrectUsageMessage.replace('${prefix}', prefix);

      message.channel.send(`${incorrectUsage}`);
      return;
    }

    // Create Embed
    const embed = new MessageEmbed()
      .setColor('36393F')
      .setFooter('React to Vote.')
      .setDescription(args.join(' '))
      .setTitle(`Poll Created By ${message.author.username}`);

    await message.channel
      .send(embed)
      .then((msg) => {
        msg.react('✅');
        msg.react('❌');
        message.delete({
          timeout: 1000,
        });
      })
      .catch((error) => {
        console.log(error);
      });
  },
};
