const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(oldChannel, newChannel) {
		const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${oldChannel.guild.id};`).get();
		if (!id) return;

		const logs = id.channel;
		if (!logs) return;

		let updateM;
		let oldTopic;
		let newTopic;
		let oldNs;
		let newNs;

		const logembed = new MessageEmbed()
			.setColor(this.client.utils.color(oldChannel.guild.me.displayHexColor))
			.setAuthor({ name: `${oldChannel.guild.name}`, iconURL: oldChannel.guild.iconURL() })
			.setTitle('Channel Updated')
			.setFooter({ text: `ID: ${newChannel.id}` })
			.setTimestamp();

		if (oldChannel.type === 'GUILD_CATEGORY') {
			if (oldChannel.name !== newChannel.name) {
				updateM = `**◎ Category Name Updated:**\nOld:\n\`${oldChannel.name}\`\nNew:\n\`${newChannel.name}\``;
				logembed.setDescription(updateM);
				this.client.channels.cache.get(logs).send({ embeds: [logembed] });
			}
		}

		if (oldChannel.type === 'GUILD_VOICE') {
			if (oldChannel.name !== newChannel.name) {
				updateM = `**◎ Voice Channel Name Updated:**\nOld:\n\`${oldChannel.name}\`\nNew:\n\`${newChannel.name}\``;
				logembed.setDescription(updateM);
				this.client.channels.cache.get(logs).send({ embeds: [logembed] });
			}
		}

		if (oldChannel.type === 'GUILD_TEXT') {
			if (oldChannel.name !== newChannel.name) {
				updateM = `**◎ Channel Name Updated:**\nOld:\n\`#${oldChannel.name}\`\nNew:\n<#${newChannel.id}>`;
				logembed.setDescription(updateM);
				this.client.channels.cache.get(logs).send({ embeds: [logembed] });
			}
		}

		if (oldChannel.nsfw !== newChannel.nsfw) {
			if (oldChannel.nsfw === true) {
				oldNs = 'Enabled';
			} else {
				oldNs = 'Disabled';
			}
			if (newChannel.nsfw === true) {
				newNs = 'Enabled';
			} else {
				newNs = 'Disabled';
			}
			updateM = `**◎ NSFW Status Updated:**\nOld:\n\`${oldNs}\`\nNew:\n\`${newNs}\``;
			logembed.setDescription(updateM);
			this.client.channels.cache.get(logs).send({ embeds: [logembed] });
		} else {
			return;
		}

		if (oldChannel.topic !== newChannel.topic) {
			if (oldChannel.topic === '') {
				oldTopic = 'None';
			} else {
				oldTopic = `${oldChannel.topic}`;
			}
			if (newChannel.topic === '') {
				newTopic = 'None';
			} else {
				newTopic = `${newChannel.topic}`;
			}
			updateM = `**◎ Channel Topic Updated:**\nOld:\n\`${oldTopic}\`\nNew:\n\`${newTopic}\``;
			logembed.setDescription(updateM);
			this.client.channels.cache.get(logs).send({ embeds: [logembed] });
		} else {
			return;
		}
	}

};
