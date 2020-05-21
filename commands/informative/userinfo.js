const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const { ownerID } = require('../../storage/config.json');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'userinfo',
    usage: '${prefix}userinfo <@user>',
    category: 'informative',
    description: 'Displays informations about the mentioned user',
    accessableby: 'Staff',
  },
  run: async (bot, message, args) => {
    if (
      !message.member.hasPermission('MANAGE_GUILD') && message.author.id !== ownerID) { return message.channel.send(`${language.userinfo.noPermission}`); }

    const user = message.mentions.users.first() || message.author;
    const member = message.mentions.members.first() || message.member;
    const embed = new MessageEmbed()
      .setAuthor(user.tag, user.avatarURL())
      .setDescription(`<@${user.id}>`)
      .addFields({ name: 'Nickname', value: member.nickname ? member.nickname : 'None', inline: true },
        { name: 'Username', value: user.username, inline: true },
        { name: 'Registered', value: `${moment(user.createdAt).format('LLLL')}`, inline: true },
        { name: 'Is a bot account?', value: user.bot ? 'Yes' : 'No', inline: true },
        { name: 'Status', value: user.presence.status, inline: true },
        { name: 'Game', value: user.presence.game ? user.presence.game.name : 'None', inline: true },
        { name: 'Joined', value: `${moment(member.joinedAt).format('LLLL')}`, inline: true },
        { name: `Roles [${member.roles.size}]`, value: member.roles.cache.map((r) => r.name).join(', '), inline: true })
      .setThumbnail(user.avatarURL())
      .setTimestamp()
      .setFooter(`ID: ${user.id}`, user.avatarURL())
      .setColor('36393F');

    message.channel.send({
      embed,
    });
  },
};
