const { MessageEmbed } = require('discord.js');
const { ownerID } = require('../../storage/config.json');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'say',
    usage: '${prefix}say <text>',
    category: 'moderation',
    description: 'Sends message of your choice',
    accessableby: 'Staff',
  },
  run: async (bot, message, args) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    if (
      !message.member.hasPermission('MANAGE_GUILD') && message.author.id !== ownerID) {
      message.channel.send(`${language.esay.noPermission}`);
      return;
    }

    if (args[0] === undefined) {
      const noinEmb = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`${language.esay.noInput}`);
      message.channel.send(noinEmb);
      return;
    }

    const sayMessage = args.join(' ');

    message.channel.send(sayMessage);
  },
};
