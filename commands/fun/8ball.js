const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: '8ball',
    usage: '${prefix}8ball <question>',
    category: 'fun',
    description: 'Question the mighty 8Ball!',
    accessableby: 'Everyone',
  },
  run: async (bot, message, args, color) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }
    const prefixgrab = db
      .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
      .get(message.guild.id);
    const { prefix } = prefixgrab;

    // if no args

    if (!args[0]) {
      const noArgumentsMessage = language['8ball'].noArguments;
      const noArguments = noArgumentsMessage.replace('${prefix}', prefix);

      message.channel.send(`${noArguments}`);
      return;
    }
    // responses

    const responses = [
      `${language['8ball'].yes}`,
      `${language['8ball'].no}`,
      `${language['8ball'].probably}`,
      `${language['8ball'].i_dont_know}`,
      `${language['8ball'].most_likely}`,
      `${language['8ball'].not_really}`,
      `${language['8ball'].ask_again}`,
      `${language['8ball'].no_response}`,
    ];

    // perms checking

    if (!message.channel.permissionsFor(message.guild.me).has('EMBED_LINKS')) {
      message.channel.send(
        `:8ball: **| ${
          responses[Math.floor(Math.random() * responses.length)]
        }, ${message.author.username}**`,
      );
      return;
    }

    // embed
    const embed = new MessageEmbed()
      .setColor(color)
      .setTitle(
        `:8ball: | ${
          responses[Math.floor(Math.random() * responses.length)]
        }, ${message.author.username}`,
      );
    message.channel.send({
      embed,
    });
  },
};
