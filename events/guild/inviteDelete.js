const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, invite) => {
  const id = db
    .prepare(`SELECT channel FROM logging WHERE guildid = ${invite.guild.id};`)
    .get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;

  const logembed = new MessageEmbed()
    .setAuthor(invite.guild, invite.guild.iconURL())
    .setDescription(`**Invite Deleted:**\n**Invite Code:** \`${invite.code}\``)
    .setColor('990000')
    .setTimestamp();
  bot.channels.cache.get(logs).send(logembed);
};
