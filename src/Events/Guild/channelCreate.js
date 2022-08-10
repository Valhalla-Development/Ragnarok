const Event = require('../../Structures/Event');
const { EmbedBuilder, ChannelType } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(channel) {
		if (channel.type === ChannelType.DM) return;

		const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${channel.guild.id};`).get();
		if (!id) return;

		const logs = id.channel;
		if (!logs) return;

		const chnCheck = this.client.channels.cache.get(logs);
		if (!chnCheck) {
			db.prepare('DELETE FROM logging WHERE guildid = ?').run(channel.guild.id);
		}

		const logembed = new EmbedBuilder()
			.setColor(this.client.utils.color(channel.guild.members.me.displayHexColor))
			.setAuthor({ name: `${channel.guild.name}`, iconURL: channel.guild.iconURL() })
			.setTitle('Channel Created')
			.setFooter({ text: `ID: ${channel.id}` })
			.setTimestamp();

		let updateM;

		if (channel.type === ChannelType.GuildText) {
			updateM = `**◎ Text Channel Created:**\n<#${channel.id}>`;
			logembed
				.setDescription(updateM);
			this.client.channels.cache.get(logs).send({ embeds: [logembed] });
		}

		if (channel.type === ChannelType.GuildVoice) {
			updateM = `**◎ Voice Channel Created:**\n\`${channel.name}\``;
			logembed
				.setDescription(updateM);
			this.client.channels.cache.get(logs).send({ embeds: [logembed] });
		}

		if (channel.type === ChannelType.GuildCategory) {
			updateM = `**◎ Category Created:**\n\`${channel.name}\``;
			logembed
				.setDescription(updateM);
			this.client.channels.cache.get(logs).send({ embeds: [logembed] });
		}
	}

};
