const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, oldMember, newMember, color) => {
  const id = db
    .prepare(`SELECT channel FROM logging WHERE guildid = ${oldMember.guild.id};`)
    .get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;

};
