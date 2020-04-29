/* eslint-disable global-require */
/* eslint-disable no-eval */
/* eslint-disable no-unused-vars */
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const { ownerID } = require('../../storage/config.json');

module.exports = {
  config: {
    name: 'eval',
    usage: '${prefix}eval',
    category: 'owner',
    description: ' ',
    accessableby: 'Owner',
  },
  run: async (bot, message, args) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    if (message.author.id !== ownerID) return;

    function clean(text) {
      if (typeof text === 'string') {
        return text
          .replace(/'/g, `\`${String.fromCharCode(8203)}`)
          .replace(/@/g, `@${String.fromCharCode(8203)}`);
      }
      return text;
    }

    const argresult = args.join(' ');
    if (!argresult) {
      return message.channel.send('Please Specify a Code To Run!');
    }

    try {
      let evaled = eval(argresult);

      if (typeof evaled !== 'string') evaled = require('util').inspect(evaled);
      if (evaled.includes(bot.token)) {
        console.log(
          `\n${message.author.username}#${
            message.author.discriminator
          } Try To Get The Bot Token On ${message.guild.name} (ServerID: ${
            message.guild.id
          }).\n`,
        );
        return message.channel.send('', {
          embed: {
            color: '36393F',
            title: ':exclamation::exclamation: No :exclamation::exclamation:',
            description: 'No Token For You!',
          },
        });
      }

      const embed = new MessageEmbed()
        .addFields({ name: `${bot.user.username} - JavaScript Eval Success:`, value: '** **' },
          { name: ':inbox_tray: **INPUT**', value: `\`\`\`${args.join(' ')}\`\`\`` },
          { name: ':outbox_tray: **OUTPUT**', value: `\`\`\`${clean(evaled)}\`\`\`` })
        .setColor('36393F')
        .setFooter(message.createdAt, message.author.avatarURL());
      message.channel.send({
        embed,
      });
    } catch (err) {
      message.channel
        .send(
          new MessageEmbed()
            .addFields({ name: `${bot.user.username} - JavaScript Eval Error:`, value: 'There Was a Problem With The Code That You Are Trying To Run!' },
              { name: ':no_entry: ERROR', value: `\`\`\`${clean(err)}\`\`\`` })
            .setColor('36393F')
            .setFooter(message.createdAt, message.author.avatarURL()),
        )

        .catch((error) => message.channel.send(`**ERROR:** ${error.message}`));
    }
  },
};
