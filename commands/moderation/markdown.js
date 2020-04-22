const { MessageEmbed } = require('discord.js');
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
  run: async (bot, message, args, color) => {
    if (
      !message.member.hasPermission('MANAGE_GUILD') && message.author.id !== ownerID) {
      message.channel.send(`${language.esay.noPermission}`);
      return;
    }

    if (args[0] === undefined) {
      const noinEmb = new MessageEmbed()
        .setColor(color)
        .setDescription(`${language.markdown.noInput}`);
      message.channel.send(noinEmb);
      return;
    }

    const extension = args[0].toLowerCase();
    const sayMessage = args.slice(1).join(' ');

    message.channel.send(sayMessage, ({ code: extension }));
  },
};
