const { MessageEmbed } = require('discord.js');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'report',
    usage: '${prefix}report <@user>',
    category: 'informative',
    description: 'Reports a user',
    accessableby: 'Everyone',
  },
  run: async (bot, message, args) => {
    const target = message.guild.member(
      message.mentions.users.first() || message.guild.members.cache.get(args[0]),
    );
    const reports = message.guild.channels.cache.find((x) => x.name === 'reports');
    const reason = args.slice(1).join(' ');

    if (!target) {
      return message.channel.send(`${language.report.notarget}`).then((message) => message.delete({
        timeout: 5000,
      }));
    }
    if (!reason) {
      return message.channel.send(`${language.report.noreason}`).then((message) => message.delete({
        timeout: 5000,
      }));
    }
    if (!reports) {
      return message.channel
        .send(`${language.report.nochannel}`)
        .then((message) => message.delete({
          timeout: 5000,
        }));
    }

    const reportembed = new MessageEmbed()
      .setThumbnail(target.user.avatarURL())
      .setAuthor(
        'Report',
        'https://cdn.discordapp.com/emojis/465245981613621259.png?v=1',
      )
      .setDescription(`New report by ${message.author.username}`)
      .addFields({ name: '⚠ - Reported Member', value: `${target.user.tag}\n(${target.user.id})`, inline: true },
        { name: '⚠ - Reported by', value: `${message.author.tag}\n(${message.author.id})`, inline: true },
        { name: '⚙ - Channel', value: message.channel },
        { name: '🔨 - Reason', value: reason })
      .setColor('0xfc4f35')
      .setTimestamp();
    reports.send(reportembed);

    message.channel
      .send(`**${target}** was reported by **${message.author}**`)
      .then((message) => message.delete({
        timeout: 5000,
      }));
  },
};
