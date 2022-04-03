const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays available commands.',
			category: 'Ticket',
			userPerms: ['MANAGE_GUILD']
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		if (args[0] === undefined) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setThumbnail(this.client.user.displayAvatarURL({ dynamic: true }))
				.setAuthor({ name: `Tickets`, iconURL: this.client.user.displayAvatarURL({ dynamic: true }) })
				.addField(`Available Commands`,
					`**◎ 📩 Open ticket:** \`${prefix}new\`
				**◎ 📩 Close Ticket (Admin):** \`${prefix}close\`
				**◎ 📩 Add User to Ticket (Admin):** \`${prefix}add\`
				**◎ 📩 Remove User from Ticket (Admin):** \`${prefix}remove\`
				**◎ 📩 Rename (Admin):** \`${prefix}rename\`
				**◎ 📩 List tickets (Admin):** \`${prefix}ticket list\``);
			message.channel.send({ embeds: [embed] });
		} else if (args[0] === 'list') {
			const ticketGrab = db
				.prepare('SELECT count(*) FROM tickets WHERE guildid = ?')
				.get(message.guild.id);
			if (!ticketGrab['count(*)']) {
				this.client.utils.messageDelete(message, 10000);

				const noTickets = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ticket**`,
						`**◎ Error:** There are currently no tickets open in this guild!`);
				message.channel.send({ embeds: [noTickets] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const ticketList = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addFields({ name: 'Tickets', value: `There are currently ${ticketGrab['count(*)']} tickets open.` });
			message.channel.send({ embeds: [ticketList] });
			return;
		} else if (args[0] === 'clear') {
			const ticketGrab = db.prepare('SELECT * FROM tickets WHERE guildid = ?').get(message.guild.id);
			if (!ticketGrab) {
				const noTickets = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setDescription('There are currently no tickets open in this guild!');
				message.channel.send({ embeds: [noTickets] });
				return;
			}

			const confirmClear = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setDescription(
					`**WARNING** If you use this command while you have tickets open, you will **lose functionality** of the \`${prefix}close\` & \`${prefix}confirm\` commands for those tickets!\nIf you wish to continue with this command, reply with the message \`${prefix}confirm\`\nYou have 20 seconds to reply.`
				);
			message.channel.send({ embeds: [confirmClear] }).then((m) => {
				m.awaitMessages(
					(response) => response.content === `${prefix}confirm`,
					{
						max: 1,
						time: 20000,
						errors: ['time']
					}
				).then(() => {
					db.prepare('DELETE FROM tickets WHERE guildid = ?').run(message.guild.id);
					const clearedMessage = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.setDescription(
							'All tickets succesfully cleared from the database!'
						);
					message.channel.send({ embeds: [clearedMessage] });
				});
			});
		}
	}

};
