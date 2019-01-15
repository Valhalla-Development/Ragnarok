const Discord = require("discord.js");
const moment = require("moment");
const SQLite = require('better-sqlite3')
const db = new SQLite('./Storage/db/db.sqlite');

function convertMS(ms) {
  var d, h, m, s;
  s = Math.floor(ms / 1000);
  m = Math.floor(s / 60);
  s = s % 60;
  h = Math.floor(m / 60);
  m = m % 60;
  d = Math.floor(h / 24);
  h = h % 24;
  return {
    d: d,
    h: h,
    m: m,
    s: s
  };
}

module.exports.run = async (client, message, args, color) => {
  const prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);

  let prefix = prefixgrab.prefix;

  if (!message.content.startsWith(prefix)) return;

  let u = convertMS(client.uptime);
  let uptime =
    u.d +
    " days : " +
    u.h +
    " hours : " +
    u.m +
    " minutes : " +
    u.s +
    " seconds";

  const duration = moment.duration(client.uptime);
  const botembed = new Discord.RichEmbed()
    .setTitle("Uptime")
    .setColor(`RANDOM`)
    .setDescription(`${uptime}`);

  message.channel.send(botembed);
};

module.exports.help = {
  name: "uptime"
};