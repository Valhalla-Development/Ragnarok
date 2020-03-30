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
  run: async (bot, message, args, color) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    if (!args[0]) {
      const noinEmbed = new MessageEmbed()
        .setColor(color)
        .setDescription(`${language.bugreport.noInput}`);
      message.channel.send(noinEmbed);
      return;
    }

    const argresult = args.join(' ');

    const embed = new MessageEmbed()
      .setColor(color)
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
      .setColor(color)
      .setDescription(`${language.bugreport.bugLogged}`);
    message.channel.send(loggedEmbed);
  },
};
