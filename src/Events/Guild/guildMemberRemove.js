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
	}

};
