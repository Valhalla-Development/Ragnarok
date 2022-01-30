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

		// Member Count

		// Check if member count is on, if it is, grab the id of said channels and return if it matches

		const memStat = db.prepare(`SELECT * FROM membercount WHERE guildid = ${oldChannel.guild.id};`).get();
		if (memStat) {
			const channelA = this.client.channels.cache.find((a) => a.id === memStat.channela);
			if (!channelA) {
				db.prepare('DELETE FROM membercount WHERE guildid = ?').run(oldChannel.guild.id);
				return;
			}
			const channelB = this.client.channels.cache.find((b) => b.id === memStat.channelb);
			if (!channelB) {
				db.prepare('DELETE FROM membercount WHERE guildid = ?').run(oldChannel.guild.id);
				return;
			}
			const channelC = this.client.channels.cache.find((c) => c.id === memStat.channelc);
			if (!channelC) {
				db.prepare('DELETE FROM membercount WHERE guildid = ?').run(oldChannel.guild.id);
				return;
			}

			if (oldChannel.id === channelA.id) {
				return;
			}
			if (oldChannel.id === channelB.id) {
				return;
			}
			if (oldChannel.id === channelC.id) {
				return;
			}
		}

		const logembed = new MessageEmbed()
			.setColor(this.client.utils.color(oldChannel.guild.me.displayHexColor))
			.setAuthor({ name: oldChannel.guild.name, iconURL: oldChannel.guild.iconURL() })
			.setTitle('Channel Updated')
			.setFooter({ text: `ID: ${newChannel.id}` })
			.setTimestamp();

		if (oldChannel.type === 'category') {
			if (oldChannel.name !== newChannel.name) {
				updateM = `**◎ Category Name Updated:**\nOld:\n\`${oldChannel.name}\`\nNew:\n\`${newChannel.name}\``;
				logembed.setDescription(updateM);
				this.client.channels.cache.get(logs).send({ embeds: [logembed] });
			}
		}

		if (oldChannel.type === 'voice') {
			if (oldChannel.name !== newChannel.name) {
				updateM = `**◎ Voice Channel Name Updated:**\nOld:\n\`${oldChannel.name}\`\nNew:\n\`${newChannel.name}\``;
				logembed.setDescription(updateM);
				this.client.channels.cache.get(logs).send({ embeds: [logembed] });
			}
		}

		if (oldChannel.type === 'text') {
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
