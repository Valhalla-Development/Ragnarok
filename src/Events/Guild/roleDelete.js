const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(role) {
		const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${role.guild.id};`).get();
		if (!id) return;

		const logs = id.channel;
		if (!logs) return;

		const logembed = new MessageEmbed()
			.setAuthor(role.guild, role.guild.iconURL())
			.setDescription(`**◎ Role Deleted: \`${role.name}\`.**`)
			.setColor(this.client.utils.color(role.guild.me.displayHexColor))
			.setTimestamp();
		this.client.channels.cache.get(logs).send(logembed);
	}

};
