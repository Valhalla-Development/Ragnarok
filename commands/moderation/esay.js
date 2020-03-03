const { MessageEmbed } = require('discord.js');
const { ownerID } = require('../../storage/config.json');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'esay',
    usage: '${prefix}esay <text>',
    category: 'moderation',
    description: 'Embeds a message of your choice',
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
        .setColor('36393F')
        .setDescription(`${language.esay.noInput}`);
      message.channel.send(noinEmb);
      return;
    }

    const sayMessage = args.join(' ');

    const esayEmbed = new MessageEmbed()
      .setColor(color)
      .setDescription(`${sayMessage}`);

    message.delete();

    message.channel.send(esayEmbed);
  },
};
