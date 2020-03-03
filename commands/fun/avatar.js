const { MessageEmbed } = require('discord.js');

module.exports = {
  config: {
    name: 'avatar',
    aliases: ['pfp'],
    usage: '${prefix}avatar <@user>',
    category: 'fun',
    description: 'Displays avatar of specified user',
    accessableby: 'Everyone',
  },
  run: async (bot, message) => {
    const user = message.mentions.users.first() || message.author;

    const embed = new MessageEmbed()
      .setAuthor(`${user.username}'s Avatar`)
      .setImage(user.displayAvatarURL())
      .setColor('36393F');

    message.channel.send(embed);
  },
};
