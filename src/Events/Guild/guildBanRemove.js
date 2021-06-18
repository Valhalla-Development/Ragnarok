const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(ban) {
		const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${ban.guild.id};`).get();
		if (!id) return;

		const logs = id.channel;
		if (!logs) return;

		const entry = await ban.guild.fetchAuditLogs({ type: 'MEMBER_BAN_REMOVE' }).then((audit) => audit.entries.first());

		if (entry.reason && entry.reason.includes('tempban')) return;

		const mod = entry.executor.id;

		const embed = new MessageEmbed()
			.setThumbnail(this.client.user.displayAvatarURL())
			.setColor(this.client.utils.color(ban.guild.me.displayHexColor))
			.addField('User Unbanned',
				`**◎ User:** ${ban.user.tag}
				**◎ Moderator:**: ${mod}`)
			.setFooter('User Ban Logs')
			.setTimestamp();
		this.client.channels.cache.get(logs).send({ embeds: [embed] });
	}

};
