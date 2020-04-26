const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, role) => {
  const id = db
    .prepare(`SELECT channel FROM logging WHERE guildid = ${role.guild.id};`)
    .get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  const logembed = new MessageEmbed()
    .setAuthor(role.guild, role.guild.iconURL())
    .setDescription(`**Role Created: \`${role.name}\`.**`)
    .setColor('990000')
    .setTimestamp();
  bot.channels.cache.get(logs).send(logembed);
};
