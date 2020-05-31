/* eslint-disable prefer-const */
const { MessageEmbed } = require('discord.js');
const ms = require('ms');

module.exports = {
  config: {
    name: 'uptime',
    usage: '${prefix}uptime',
    category: 'informative',
    description: 'Displays how long the bot has been running',
    accessableby: 'Everyone',
  },
  run: async (bot, message) => {
    const botembed = new MessageEmbed()
      .setTitle('Uptime')
      .setColor('36393F')
      .setDescription(`My uptime is \`${ms(bot.uptime, { long: true })}\``);

    message.channel.send(botembed);
  },
};
