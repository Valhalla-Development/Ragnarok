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
  run: async (bot, message, color) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    const user = message.mentions.users.first() || message.author;

    const embed = new MessageEmbed()
      .setAuthor(`${user.username}'s Avatar`)
      .setImage(user.avatarURL({ dynamic: true, size: 1024 }))
      .setColor(color);
    message.channel.send(embed);
  },
};
