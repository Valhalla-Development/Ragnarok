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

		function checkTicket(client) {
			// Check if the user has a ticket
			const foundTicket = db.prepare(`SELECT * FROM tickets WHERE guildid = ${member.guild.id} AND authorid = (@authorid)`);
			if (foundTicket.get({ authorid: member.user.id })) {
				// Fetch the channel
				const channel = member.guild.channels.cache.get(foundTicket.get({ authorid: member.user.id }).chanid);

				// Check if the channel exists
				if (channel) {
					// Send a message that the user left
					const existTM = new MessageEmbed()
						.setColor(client.utils.color(member.guild.me.displayHexColor))
						.addField(`**${client.user.username} - Ticket**`,
							`**◎ Error:** \`${member.user.tag}\` has the left the server\nThey will be added back to the ticket if they rejoin.`);
					channel.send({ embeds: [existTM] });
				}
			}
		}
		checkTicket(this.client);

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
