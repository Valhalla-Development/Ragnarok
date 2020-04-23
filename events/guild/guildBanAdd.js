const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, guild, user, color) => {
  const id = db
    .prepare(`SELECT channel FROM logging WHERE guildid = ${guild.id};`)
    .get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  const entry = await guild
    .fetchAuditLogs({
      type: 'MEMBER_BAN_ADD',
    })
    .then((audit) => audit.entries.first());

  const mod = entry.executor.id;
  let { reason } = entry;
  if (reason === 'None given') {
    reason = 'None given.';
  } else {
    reason = entry.reason;
  }
  const logembed = new MessageEmbed()
    .setAuthor(guild, guild.iconURL())
    .setDescription(`**User Banned:** \`${user.tag}\`**\nModerator**: <@${mod}>\n**Reason**: \`${reason}\``)
    .setColor(color)
    .setFooter(`ID: ${mod}`)
    .setTimestamp();
  bot.channels.cache.get(logs).send(logembed);
};
