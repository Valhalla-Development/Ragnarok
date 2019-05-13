const {
    MessageEmbed
} = require("discord.js");
const {
    color
} = require("../../storage/config.json");
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, guild, user) => {

    const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${guild.id};`).get();
    if (!id) return;
    const logs = id.channel;
    if (!logs) return;
    const entry = await guild.fetchAuditLogs({
        type: 'MEMBER_BAN_REMOVE'
    }).then(audit => audit.entries.first());
    let mod = entry.executor.id;
    const logembed = new MessageEmbed()
        .setAuthor(guild, guild.iconURL)
        .setDescription(`**User Unbanned: \`${user.tag}\`.**\nModerator: <@${mod}>`)
        .setColor(color)
        .setFooter(`ID: ${mod}`)
        .setTimestamp();
    bot.channels.get(logs).send(logembed);
};