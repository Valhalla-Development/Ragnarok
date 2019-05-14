/* eslint-disable no-unused-vars, no-undef */
const { MessageEmbed } = require('discord.js');
const { ownerID } = require('../../storage/config.json');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
	config: {
		name: 'ticket',
		usage: '${prefix}ticket',
		category: 'ticket',
		description: 'Displays available Ticket commands',
		accessableby: 'Everyone',
	},
	run: async (bot, message, args) => {
		const prefixgrab = db
			.prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
			.get(message.guild.id);
		const prefix = prefixgrab.prefix;

		if (args[0] == undefined) {
			const embed = new MessageEmbed().setColor(0xcf40fa).addField(
				'Ragnarok - Tickets',
				`[${prefix}new]() (reason) : Opens up a new ticket\n[${prefix}close]() : Closes a ticket that has been resolved
                \n**Admin Commands:** (Run Inside of a Ticket Channel)\n[${prefix}add]() : Adds a user to a ticket (mention a user)\n[${prefix}remove]() : Removes a user from a ticket (mention a user)\n[${prefix}rename]() : Renames the ticket\n[${prefix}forceclose]() : Force closes a ticket
                \n**Global Admin Commands:** (Can Be Run Anywhere in the Server)\n[${prefix}add]() [@user] [ticketid]: Adds a user to a ticket (mention a user)\n[${prefix}remove]() [@user] [ticketid] : Removes a user from a ticket (mention a user)\n[${prefix}rename]() [ticketid] [newname] : Renames the ticket\n[${prefix}forceclose]() [ticketid] : Force closes a ticket\n[${prefix}ticket list]() : Lists all open tickets
                \n\n**NOTE:** The ticket ID is the last 7 characters of a ticket channel. Also, for those new to reading a command menu, don't run the commands with the parentheses or brackets. They are there ONLY to specify that it needs an input and is not an integral part of the command.`
			);
			message.channel.send({
				embed: embed,
			});
		}
		else if (args[0] == 'list') {
			if (
				!message.member.hasPermission('ADMINISTRATOR') &&
				message.author.id !== ownerID
			) {
				message.channel
					.send(
						'You need to have the `ADMINISTRATOR` permission to use this command!'
					)
					.then(msg => {
						msg.delete({
							timeout: 10000,
						});
					});
				return;
			}
			const ticketGrab = db
				.prepare('SELECT count(*) FROM tickets WHERE guildid = ?')
				.get(message.guild.id);
			if (!ticketGrab['count(*)']) {
				const noTickets = new MessageEmbed()
					.setColor(0xcf40fa)
					.setDescription('There are currently no tickets open in this guild!');
				message.channel.send(noTickets);
				return;
			}
			else {
				const ticketList = new MessageEmbed()
					.setColor(0xcf40fa)
					.addField(
						`There are currently ${ticketGrab['count(*)']} tickets open`,
						'LIST OF IDS COMING SOON'
					);
				// and somehow display them in a collection type deal :D
				message.channel.send(ticketList);
				return;
			}
		}
		else if (args[0] == 'clear') {
			if (
				!message.member.hasPermission('ADMINISTRATOR') &&
				message.author.id !== ownerID
			) {
				message.channel
					.send(
						'You need to have the `ADMINISTRATOR` permission to use this command!'
					)
					.then(msg => {
						msg.delete({
							timeout: 10000,
						});
					});
				return;
			}
			const ticketGrab = db
				.prepare('SELECT * FROM tickets WHERE guildid = ?')
				.get(message.guild.id);
			if (!ticketGrab) {
				const noTickets = new MessageEmbed()
					.setColor(0xcf40fa)
					.setDescription('There are currently no tickets open in this guild!');
				message.channel.send(noTickets);
				return;
			}
			else {
				const confirmClear = new MessageEmbed()
					.setColor(0xcf40fa)
					.setDescription(
						`**WARNING** If you use this command while you have tickets open, you will **lose functionality** of the \`${prefix}close\` & \`${prefix}confirm\` commands for those tickets!\nIf you wish to continue with this command, reply with the message \`${prefix}confirm\`\nYou have 20 seconds to reply.`
					);
				message.channel
					.send(confirmClear)
					.then(m => {
						message.channel
							.awaitMessages(
								response => response.content === prefix + 'confirm',
								{
									max: 1,
									time: 20000,
									errors: ['time'],
								}
							)
							.then(() => {
								db.prepare('DELETE FROM tickets WHERE guildid = ?').run(
									message.guild.id
								);
								const clearedMessage = new MessageEmbed()
									.setColor(0xcf40fa)
									.setDescription(
										'All tickets succesfully cleared from the database!'
									);
								message.channel.send(clearedMessage);
							});
					})
					.catch(() => {
						m.delete();
					});
			}
		}
	},
};
