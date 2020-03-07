const { MessageEmbed } = require('discord.js');
const hastebin = require('hastebin-gen');
const fetch = require('node-fetch');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
  config: {
    name: 'hastebin',
    usage: '${prefix}hastebin <text/attachment>',
    category: 'fun',
    description: 'Posts args to hastebin',
    accessableby: 'Everyone',
  },
  run: async (bot, message, args) => {
    const prefixgrab = db
      .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
      .get(message.guild.id);
    const { prefix } = prefixgrab;

    if (message.attachments.size === 1) {
      const file = message.attachments.first().url;
      const fileExtension = file.substring(
        file.lastIndexOf('.') + 1,
      );
      const validExtensions = ['bat', 'c', 'cpp', 'css', 'html', 'ini', 'java', 'js', 'jsx', 'json', 'lua', 'md', 'php', 'py', 'pyc', 'scss', 'sql', 'xml', 'yaml', 'txt'];
      if (!validExtensions.includes(fileExtension)) {
        message.delete();
        const badType = new MessageEmbed()
          .setColor('36393F')
          .setDescription(`\`.${fileExtension}\` is not a valid file type!\nIf this is not true, please report it to my creator with \`${prefix}bugreport <message>\``);
        message.channel.send(badType);
        return;
      }
      await fetch(file)
        .then((res) => res.text())
        .then((body) => {
          if (!body) {
            const emptyFile = new MessageEmbed()
              .setColor('36393F')
              .setDescription(':x: You can not upload an empty file!');
            message.channel.send(emptyFile);
            return;
          }
          hastebin(body, { extension: fileExtension })
            .then((r) => {
              const hastEmb = new MessageEmbed()
                .setColor('RANDOM')
                .setAuthor('Hastebin Link:')
                .setDescription(`${r}\nPosted By: ${message.author}`)
                .setURL(r);
              message.channel.send(hastEmb);
            });
        }).catch((err) => console.error(err) && message.channel.send(':slight_frown: An error occured!'));
      message.delete();
      return;
    } if (message.attachments.size > 1) {
      message.channel.send('You can only post 1 file at a time!');
      return;
    }
    if (args[0] === undefined) {
      const embed = new MessageEmbed()
        .setColor('RANDOM')
        .setDescription(':x: | You must input some text');
      message.channel.send(embed);
      return;
    }

    hastebin(args.join(' '), { extension: 'txt' })
      .then((r) => {
        const hastEmb = new MessageEmbed()
          .setColor('RANDOM')
          .setAuthor('Hastebin Link:')
          .setDescription(`${r}\nPosted By: ${message.author}`)
          .setURL(r);
        message.channel.send(hastEmb);
      });
  },
};
