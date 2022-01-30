const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(member) {
		this.client.user.setActivity(`${this.client.prefix}help | ${this.client.guilds.cache.size.toLocaleString('en')} Guilds ${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')} Users`,
			{
				type: 'WATCHING'
			}
		);

		function logging(grabClient) {
			const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${member.guild.id};`).get();
			if (!id) return;

			const logs = id.channel;
			if (!logs) return;

			const chnCheck = grabClient.channels.cache.get(logs);
			if (!chnCheck) {
				db.prepare('DELETE FROM logging WHERE guildid = ?').run(member.guild.id);
			}

			const logembed = new MessageEmbed()
				.setAuthor({ name: 'Member Left', iconURL: member.user.avatarURL() })
				.setDescription(`${member.user.tag}`)
				.setColor(grabClient.utils.color(member.guild.me.displayHexColor))
				.setFooter({ text: `ID: ${member.user.id}` })
				.setTimestamp();
			grabClient.channels.cache.get(logs).send({ embeds: [logembed] });
		}
		logging(this.client);

		// Member Count
		const memStat = db.prepare(`SELECT * FROM membercount WHERE guildid = ${member.guild.id};`).get();
		if (memStat) {
			const channelA = this.client.channels.cache.find((a) => a.id === memStat.channela);
			const channelB = this.client.channels.cache.find((b) => b.id === memStat.channelb);
			const channelC = this.client.channels.cache.find((c) => c.id === memStat.channelc);

			if (channelA) {
				channelA.setName(`Users: ${(member.guild.memberCount - member.guild.members.cache.filter((m) => m.user.bot).size).toLocaleString('en')}`);
			} else {
				db.prepare('DELETE FROM membercount WHERE guildid = ?').run(member.guild.id);
			}
			if (channelB) {
				channelB.setName(`Bots: ${member.guild.members.cache.filter((m) => m.user.bot).size}`);
			} else {
				db.prepare('DELETE FROM membercount WHERE guildid = ?').run(member.guild.id);
			}
			if (channelC) {
				channelC.setName(`Total: ${member.guild.memberCount.toLocaleString('en')}`);
			} else {
				db.prepare('DELETE FROM membercount WHERE guildid = ?').run(member.guild.id);
			}
		}
	}

};
