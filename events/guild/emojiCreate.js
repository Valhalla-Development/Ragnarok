const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, emoji, color) => {
  const id = db
    .prepare(`SELECT channel FROM logging WHERE guildid = ${emoji.guild.id};`)
    .get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  const logembed = new MessageEmbed()
    .setAuthor(emoji.guild, emoji.guild.iconURL())
    .setDescription(`**Emoji Added**:\n<:${emoji.name}:${emoji.id}>`)
    .setColor(color)
    .setTimestamp();
  bot.channels.cache.get(logs).send(logembed);
};
