const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(invite) {
		const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${invite.guild.id};`).get();
		if (!id) return;
		const logs = id.channel;
		if (!logs) return;

		const logembed = new MessageEmbed()
			.setColor(invite.guild.me.displayHexColor || '36393F')
			.setAuthor(invite.guild, invite.guild.iconURL())
			.setDescription(`**◎ Invite Deleted:**\n**◎ Invite Code:** \`${invite.code}\``)
			.setTimestamp();
		this.client.channels.cache.get(logs).send(logembed);
	}

};
