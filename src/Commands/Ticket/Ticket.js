const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays available commands.',
			category: 'Ticket'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		if (args[0] === undefined) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addFields({ name: 'Ragnarok - Tickets', value: `[${prefix}new]() (reason) : Opens up a new ticket\n[${prefix}close]() (reason) : Closes a ticket that has been resolved\n**Admin Commands:** (Run Inside of a Ticket Channel)\n[${prefix}add]() : Adds a user to a ticket (mention a user)\n[${prefix}remove]() : Removes a user from a ticket (mention a user)\n[${prefix}rename]() : Renames the ticket\n[${prefix}forceclose]() : Force closes a ticket\n**Global Admin Commands:** (Can Be Run Anywhere in the Server)\n[${prefix}add]() [@user] [ticketid]: Adds a user to a ticket (mention a user)\n[${prefix}remove]() [@user] [ticketid] : Removes a user from a ticket (mention a user)\n[${prefix}rename]() [ticketid] [newname] : Renames the ticket\n[${prefix}forceclose]() [ticketid] : Force closes a ticket\n[${prefix}ticket list]() : Lists all open tickets\n\n**NOTE:** The ticket ID is the last 7 characters of a ticket channel. Also, for those new to reading a command menu, don't run the commands with the parentheses or brackets. They are there ONLY to specify that it needs an input and is not an integral part of the command.` });
			message.channel.send(embed);
		} else if (args[0] === 'list') {
			if (
				!message.member.hasPermission('ADMINISTRATOR') && !this.client.owners.includes(message.author.id)) {
				message.channel.send('You need to have the `ADMINISTRATOR` permission to use this command!').then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			const ticketGrab = db
				.prepare('SELECT count(*) FROM tickets WHERE guildid = ?')
				.get(message.guild.id);
			if (!ticketGrab['count(*)']) {
				const noTickets = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ticket**`,
						`**◎ Error:** There are currently no tickets open in this guild!`);
				message.channel.send(noTickets).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			const ticketList = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addFields({ name: 'Tickets', value: `There are currently ${ticketGrab['count(*)']} tickets open.` });
			message.channel.send(ticketList);
			return;
		} else if (args[0] === 'clear') {
			if (!message.member.hasPermission('ADMINISTRATOR') && !this.client.owners.includes(message.author.id)) {
				message.channel.send('You need to have the `ADMINISTRATOR` permission to use this command!').then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			const ticketGrab = db.prepare('SELECT * FROM tickets WHERE guildid = ?').get(message.guild.id);
			if (!ticketGrab) {
				const noTickets = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setDescription('There are currently no tickets open in this guild!');
				message.channel.send(noTickets);
				return;
			}

			const confirmClear = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setDescription(
					`**WARNING** If you use this command while you have tickets open, you will **lose functionality** of the \`${prefix}close\` & \`${prefix}confirm\` commands for those tickets!\nIf you wish to continue with this command, reply with the message \`${prefix}confirm\`\nYou have 20 seconds to reply.`
				);
			message.channel.send(confirmClear).then((m) => {
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
					message.channel.send(clearedMessage);
				});
			});
		}
	}

};
