const Event = require('../../Structures/Event');
const { EmbedBuilder } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(invite) {
		const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${invite.guild.id};`).get();
		if (!id) return;

		const logs = id.channel;
		if (!logs) return;

		const logembed = new EmbedBuilder()
			.setColor(this.client.utils.color(invite.guild.members.me.displayHexColor))
			.setAuthor({ name: `${invite.guild.name}`, iconURL: invite.guild.iconURL() })
			.setDescription(`**◎ Invite Deleted:**\n**◎ Invite Code:** \`${invite.code}\``)
			.setTimestamp();
		this.client.channels.cache.get(logs).send({ embeds: [logembed] });
	}

};
