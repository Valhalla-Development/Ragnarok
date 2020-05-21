/* eslint-disable prefer-const */
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

function convertMS(ms) {
  let d; let h; let m; let
    s;
  s = Math.floor(ms / 1000);
  m = Math.floor(s / 60);
  s %= 60;
  h = Math.floor(m / 60);
  m %= 60;
  d = Math.floor(h / 24);
  h %= 24;
  return {
    d,
    h,
    m,
    s,
  };
}

module.exports = {
  config: {
    name: 'uptime',
    usage: '${prefix}uptime',
    category: 'informative',
    description: 'Displays how long the bot has been running',
    accessableby: 'Everyone',
  },
  run: async (bot, message) => {
    const prefixgrab = db
      .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
      .get(message.guild.id);

    const { prefix } = prefixgrab;

    if (!message.content.startsWith(prefix)) return;

    const u = convertMS(bot.uptime);
    const uptime = `${u.d} days : ${u.h} hours : ${u.m} minutes : ${u.s} seconds`;

    const botembed = new MessageEmbed()
      .setTitle('Uptime')
      .setColor('36393F')
      .setDescription(`${uptime}`);

    message.channel.send(botembed);
  },
};
