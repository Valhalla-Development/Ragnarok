const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const { ownerID } = require('../../storage/config.json');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'markdown',
    usage: '${prefix}markdown <language> <text>',
    category: 'moderation',
    description: 'Posts a markdown text',
    accessableby: 'Staff',
  },
  run: async (bot, message, args) => {
    if (
      !message.member.hasPermission('MANAGE_GUILD') && message.author.id !== ownerID) {
      message.channel.send(`${language.markdown.noPermission}`);
      return;
    }

    const prefixgrab = db
      .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
      .get(message.guild.id);
    const { prefix } = prefixgrab;

    const noArgumentsMessage = language.markdown.noInput;
    const noArguments = noArgumentsMessage.replace('${prefix}', prefix);

    if (args[0] === undefined) {
      const noinEmb = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`${noArguments}`);
      message.channel.send(noinEmb);
      return;
    }
    if (args[1] === undefined) {
      const noinEmb = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`${noArguments}`);
      message.channel.send(noinEmb);
      return;
    }


    const extension = args[0].toLowerCase();
    const sayMessage = args.slice(1).join(' ');

    message.channel.send(sayMessage, ({ code: extension }));
  },
};
