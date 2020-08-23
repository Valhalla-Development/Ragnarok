const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(guild, user) {
		const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${guild.id};`).get();
		if (!id) return;
		const logs = id.channel;
		if (!logs) return;
		const entry = await guild.fetchAuditLogs({
			type: 'MEMBER_BAN_REMOVE'
		}).then((audit) => audit.entries.first());
		const mod = entry.executor.id;
		const logembed = new MessageEmbed()
			.setAuthor(guild, guild.iconURL())
			.setDescription(`**◎ User Unbanned: \`${user.tag}\`.\n**◎ Moderator: <@${mod}>`)
			.setColor(guild.me.displayHexColor || 'A10000')
			.setFooter(`ID: ${mod}`)
			.setTimestamp();
		this.client.channels.cache.get(logs).send(logembed);
	}

};
