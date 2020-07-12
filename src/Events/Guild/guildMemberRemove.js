const Event = require('../../Structures/Event');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(member) {
		this.client.user.setActivity(`${this.prefix}help | ${this.client.guilds.cache.size.toLocaleString('en')} Guilds ${this.client.users.cache.size.toLocaleString('en')} Users`,
			{
				type: 'WATCHING'
			}
		);

		const id = db
			.prepare(`SELECT channel FROM logging WHERE guildid = ${member.guild.id};`)
			.get();
		if (id) {
			const logs = id.channel;
			if (logs) {
				const logembed = new MessageEmbed()
					.setAuthor('Member Left', member.user.avatarURL())
					.setDescription(`<@${member.user.id}> - ${member.user.tag}`)
					.setColor('990000')
					.setFooter(`ID: ${member.user.id}`)
					.setTimestamp();
				this.client.channels.cache.get(logs).send(logembed);
			}
		}

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
