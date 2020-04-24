const { MessageEmbed } = require('discord.js');
const Hastebin = require('hastebin.js');
const haste = new Hastebin({ url: 'https://pastie.io' });
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
  run: async (bot, message, args, color) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    const prefixgrab = db
      .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
      .get(message.guild.id);
    const { prefix } = prefixgrab;

    if (message.attachments.size === 1) {
      const file = message.attachments.first().url;
      const fileExtension = file.substring(
        file.lastIndexOf('.') + 1,
      );
      const validExtensions = ['bat', 'c', 'cpp', 'css', 'html', 'ini', 'java', 'js', 'jsx', 'json', 'lua', 'md', 'php', 'py', 'pyc', 'scss', 'sql', 'xml', 'yaml'];
      if (!validExtensions.includes(fileExtension)) {
        const badType = new MessageEmbed()
          .setColor(color)
          .setDescription(`\`.${fileExtension}\` is not a valid file type!\nIf this is not true, please report it to my creator with \`${prefix}bugreport <message>\``);
        message.channel.send(badType);
        return;
      }
      await fetch(file)
        .then((res) => res.text())
        .then((body) => {
          if (!body) {
            const emptyFile = new MessageEmbed()
              .setColor(color)
              .setDescription(':x: You can not upload an empty file!');
            message.channel.send(emptyFile);
            return;
          }
          haste.post(body, fileExtension)
            .then((r) => {
              console.log(body);
              const hastEmb = new MessageEmbed()
                .setColor(color)
                .setAuthor('Hastebin Link:')
                .setDescription(`${r}\nPosted By: ${message.author}`)
                .setURL(r);
              message.channel.send(hastEmb);
            }).catch(() => message.channel.send(':slight_frown: An error occured!'));
        }).catch(() => message.channel.send(':slight_frown: An error occured!'));
      return;
    } if (message.attachments.size > 1) {
      message.channel.send('You can only post 1 file at a time!');
      return;
    }
    if (args[0] === undefined) {
      const embed = new MessageEmbed()
        .setColor(color)
        .setDescription(':x: | You must input some text');
      message.channel.send(embed);
      return;
    }

    await haste.post(args.join(' '), 'js')
      .then((link) => {
        const hastEmb = new MessageEmbed()
          .setColor(color)
          .setAuthor('Hastebin Link:')
          .setDescription(`${link}\nPosted By: ${message.author}`)
          .setURL(link);
        message.channel.send(hastEmb);
      }).catch(() => message.channel.send(':slight_frown: An error occured!'));
  },
};
