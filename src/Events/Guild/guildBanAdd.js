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
			type: 'MEMBER_BAN_ADD'
		}).then((audit) => audit.entries.first());

		const mod = entry.executor.id;
		let { reason } = entry;
		if (reason === 'None given') {
			reason = 'None given.';
		} else {
			// eslint-disable-next-line prefer-destructuring
			reason = entry.reason;
		}
		const logembed = new MessageEmbed()
			.setColor(this.client.utils.color(guild.me.displayHexColor))
			.setAuthor(guild, guild.iconURL())
			.setDescription(`**◎ User Banned:** \`${user.tag}\`\n**◎ Moderator**: <@${mod}>\n**◎ Reason**: \`${reason}\``)
			.setFooter(`ID: ${mod}`)
			.setTimestamp();
		this.client.channels.cache.get(logs).send(logembed);
	}

};
