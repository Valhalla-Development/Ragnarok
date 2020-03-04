const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const { color } = require('../../storage/config.json');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, role) => {
  if (bot.guilds.cache.get('343572980351107077')) return; // REMOVE, this is for bug testing

  const id = db
    .prepare(`SELECT channel FROM logging WHERE guildid = ${role.guild.id};`)
    .get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  const logembed = new MessageEmbed()
    .setAuthor(role.guild, role.guild.iconURL())
    .setDescription(`**Role Deleted: \`${role.name}\`.**`)
    .setColor(color)
    .setTimestamp();
  bot.channels.cache.get(logs).send(logembed);
};
