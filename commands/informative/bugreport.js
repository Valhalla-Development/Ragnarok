const { MessageEmbed } = require('discord.js');
const { supportGuild, supportChannel } = require('../../storage/config.json');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'bugreport',
    usage: '${prefix}bugreport <text>',
    category: 'informative',
    description: 'Sends a message to the bot owner',
    aliases: ['br'],
    accessableby: 'Everyone',
  },
  run: async (bot, message, args) => {
    if (!args[0]) {
      const noinEmbed = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`${language.bugreport.noInput}`);
      message.channel.send(noinEmbed);
      return;
    }

    const argresult = args.join(' ');

    const embed = new MessageEmbed()
      .setColor('36393F')
      .setTitle('Bug Report')
      .setDescription(
        `**User: <@${message.author.id}> - **\`${
          message.author.tag
        }\`\n**Bug:** ${argresult}`,
      )
      .setFooter(`${message.guild.name} - ${message.guild.id}`);
    bot.guilds
      .cache.get(supportGuild)
      .channels.cache.get(supportChannel)
      .send(embed);

    const loggedEmbed = new MessageEmbed()
      .setColor('36393F')
      .setDescription(`${language.bugreport.bugLogged}`);
    message.channel.send(loggedEmbed);
  },
};
