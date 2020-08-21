const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(channel) {
		if (channel.type === 'dm') return;
		const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${channel.guild.id};`).get();
		if (!id) return;
		const logs = id.channel;
		if (!logs) return;

		const logembed = new MessageEmbed()
			.setColor(channel.guild.me.displayHexColor || '36393F')
			.setAuthor(channel.guild, channel.guild.iconURL())
			.setTitle('Channel Created')
			.setFooter(`ID: ${channel.id}`)
			.setTimestamp();

		let updateM;

		if (channel.type === 'text') {
			updateM = `**◎ Text Channel Created:**\n<#${channel.id}>`;
			logembed
				.setDescription(updateM);
			this.client.channels.cache.get(logs).send(logembed);
		}

		if (channel.type === 'voice') {
			updateM = `**◎ Voice Channel Created:**\n\`${channel.name}\``;
			logembed
				.setDescription(updateM);
			this.client.channels.cache.get(logs).send(logembed);
		}

		if (channel.type === 'category') {
			updateM = `**◎ Category Created:**\n\`${channel.name}\``;
			logembed
				.setDescription(updateM);
			this.client.channels.cache.get(logs).send(logembed);
		}
	}

};
