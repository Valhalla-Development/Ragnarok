const { MessageEmbed } = require('discord.js');

module.exports = {
  config: {
    name: 'invite',
    usage: '${prefix}invite',
    category: 'informative',
    description: 'Posts a bot invite link',
    accessableby: 'Everyone',
  },
  run: async (bot, message) => {
    const embed = new MessageEmbed()
      .setColor('36393F')
      .setDescription(
        ':white_check_mark: **Bot Invite Link**: [Click Me](https://discordapp.com/oauth2/authorize?client_id=508756879564865539&scope=bot&permissions=2050485471)',
      );
    message.channel.send(embed);
  },
};
