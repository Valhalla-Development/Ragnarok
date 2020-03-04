const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const { color } = require('../../storage/config.json');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, guild, user) => {
  if (bot.guilds.cache.get('343572980351107077')) return; // REMOVE, this is for bug testing

  const id = db
    .prepare(`SELECT channel FROM logging WHERE guildid = ${guild.id};`)
    .get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  const entry = await guild
    .fetchAuditLogs({
      type: 'MEMBER_BAN_REMOVE',
    })
    .then((audit) => audit.entries.first());
  const mod = entry.executor.id;
  const logembed = new MessageEmbed()
    .setAuthor(guild, guild.iconURL())
    .setDescription(`**User Unbanned: \`${user.tag}\`.**\nModerator: <@${mod}>`)
    .setColor(color)
    .setFooter(`ID: ${mod}`)
    .setTimestamp();
  bot.channels.cache.get(logs).send(logembed);
};
