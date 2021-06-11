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

		const entry = await guild.fetchAuditLogs({ type: 'MEMBER_BAN_ADD' }).then((audit) => audit.entries.first());

		const mod = entry.executor.id;

		let { reason } = entry;

		if (reason === 'No reason given.') {
			reason = 'No reason given.';
		} else {
			// eslint-disable-next-line prefer-destructuring
			reason = entry.reason;
		}

		const embed = new MessageEmbed()
			.setThumbnail(this.client.user.displayAvatarURL())
			.setColor(this.client.utils.color(guild.me.displayHexColor))
			.addField('User Banned',
				`**◎ User:** ${user.tag}
				**◎ Reason:**: ${reason}
				**◎ Moderator:**: ${mod}`)
			.setFooter('User Ban Logs')
			.setTimestamp();
		this.client.channels.cache.get(logs).send({ embed: embed });
	}

};
