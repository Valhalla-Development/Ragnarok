const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(channel) {
		const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${channel.guild.id};`).get();
		if (!id) return;

		const logs = id.channel;
		if (!logs) return;

		const logembed = new MessageEmbed()
			.setColor(this.client.utils.color(channel.guild.me.displayHexColor))
			.setAuthor({ name: channel.guild.name, iconURL: channel.guild.iconURL() })
			.setTitle('Channel Deleted')
			.setFooter({ text: `ID: ${channel.id}` })
			.setTimestamp();

		let updateM;

		if (channel.type === 'GUILD_TEXT') {
			updateM = `**◎ Text Channel Deleted:**\n\`#${channel.name}\``;
			logembed
				.setDescription(updateM);
			this.client.channels.cache.get(logs).send({ embeds: [logembed] });
		}

		if (channel.type === 'GUILD_VOICE') {
			updateM = `**◎ Voice Channel Deleted:**\n\`${channel.name}\``;
			logembed
				.setDescription(updateM);
			this.client.channels.cache.get(logs).send({ embeds: [logembed] });
		}

		if (channel.type === 'GUILD_CATEGORY') {
			updateM = `**◎ Category Deleted:**\n\`${channel.name}\``;
			logembed
				.setDescription(updateM);
			this.client.channels.cache.get(logs).send({ embeds: [logembed] });
		}
	}

};
