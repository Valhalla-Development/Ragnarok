const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const generate = require('nanoid/generate');
const custAlpha = '0123456789abcdefghijklmnopqrstuvwxyz';

module.exports = {
	config: {
		name: 'new',
		usage: '${prefix}new',
		category: 'ticket',
		description: 'Creates a ticket',
		accessableby: 'Everyone',
	},
	run: async (bot, message, args, color) => {
		const prefixgrab = db
			.prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
			.get(message.guild.id);
		const prefix = prefixgrab.prefix;

		const language = require('../../storage/messages.json');

		const suppRole = db
			.prepare(
				`SELECT role FROM ticketConfig WHERE guildid = ${message.guild.id}`
			)
			.get();

		if (!message.member.guild.me.hasPermission('ADMINISTRATOR')) {
			const botPerm = new MessageEmbed()
				.setColor('36393F')
				.setDescription(
					'Uh oh! It seems you have removed the `ADMINISTRATOR` permission from me. I cannot function properly without it :cry:'
				);
			message.channel.send(botPerm);
			return;
		}

		// "Support" role
		if (
			!message.guild.roles.cache.find(r => r.name === 'Support Team') &&
			!suppRole
		) {
			const nomodRole = new MessageEmbed()
				.setColor('36393F')
				.setDescription(`${language.tickets.nomodRole}`);
			message.channel.send(nomodRole);
			return;
		}
		// Make sure this is the user's only ticket.
		const foundTicket = db.prepare(
			`SELECT authorid FROM tickets WHERE guildid = ${
				message.guild.id
			} AND authorid = (@authorid)`
		);
		const checkTicketEx = db
			.prepare(`SELECT chanid FROM tickets WHERE guildid = ${message.guild.id} AND authorid = ${message.author.id}`)
			.get();
		const roleCheckEx = db
			.prepare(
				`SELECT role FROM ticketConfig WHERE guildid = ${message.guild.id}`
			)
			.get();
		if (checkTicketEx) {
			if (checkTicketEx.chanid == null) {
				db.prepare(`DELETE FROM tickets WHERE guildid = ${message.guild.id} AND authorid = ${message.author.id}`).run();
			}
			if (
				!message.guild.channels.cache.find(
					channel => channel.id === checkTicketEx.chanid
				)
			) {
				db.prepare(`DELETE FROM tickets WHERE guildid = ${message.guild.id} AND authorid = ${message.author.id}`).run();
			}
		}
		if (roleCheckEx) {
			if (!message.guild.roles.cache.find(role => role.id === roleCheckEx.role)) {
				const updateRole = db.prepare(
					`UPDATE ticketConfig SET role = (@role) WHERE guildid = ${
						message.guild.id
					}`
				);
				updateRole.run({
					role: null,
				});
			}
		}
		if (
			foundTicket.get({
				authorid: message.author.id,
			})
		) {
			const existTM = new MessageEmbed()
				.setColor('36393F')
				.setDescription(`${language.tickets.existingTicket}`);
			message.channel.send(existTM);
			return;
		}

		const nickName = message.guild.members.cache.get(message.author.id).displayName;

		// Make Ticket
		const id = db
			.prepare(
				`SELECT category FROM ticketConfig WHERE guildid = ${message.guild.id};`
			)
			.get();
		const reason = args.slice(0).join(' ') || 'No reason provided.';
		const randomString = generate(custAlpha, 7);
		if (!id) {
			const newTicket = db.prepare(
				'INSERT INTO tickets (guildid, ticketid, authorid, reason) values (@guildid, @ticketid, @authorid, @reason);'
			);
			newTicket.run({
				guildid: message.guild.id,
				ticketid: randomString,
				authorid: message.author.id,
				reason: reason,
			});
			// Create the channel with the name "ticket-" then the user's ID.
			const role =
				message.guild.roles.cache.find(x => x.name === 'Support Team') ||
				message.guild.roles.cache.find(r => r.id === suppRole.role);
			if (!role) {
				message.channel.send(
					`I could not find the \`Support Team\` role!\nIf you use a custom role, I recommend running the command again \`${prefix}config ticket role <@role>\``
				);
				return;
			}
			const role2 = message.channel.guild.roles.everyone;
			message.guild.channels
				.create(`ticket-${nickName}-${randomString}`, {
					permissionOverwrites: [
						{
							id: role.id,
							allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
						},
						{
							id: role2.id,
							deny: 'VIEW_CHANNEL',
						},
						{
							id: message.author.id,
							allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
						},
					],
				})
				.then(c => {
					const updateTicketChannel = db.prepare(
						`UPDATE tickets SET chanid = (@chanid) WHERE guildid = ${
							message.guild.id
						} AND ticketid = (@ticketid)`
					);
					updateTicketChannel.run({
						chanid: c.id,
						ticketid: randomString,
					});
					// Send a message saying the ticket has been created.
					const newTicketE = new MessageEmbed()
						.setColor('36393F')
						.setDescription(`${language.tickets.ticketCreated}, <#${c.id}>.`);
					message.channel.send(newTicketE).then(msg =>
						msg.delete({
							timeout: 5000,
						})
					);
					message.delete({
						timeout: 5000,
					});
					const embed = new MessageEmbed()
						.setColor(0xcf40fa)
						.setTitle('New Ticket')
						.setDescription(
							`Hello \`${
								message.author.tag
							}\`! Welcome to our support ticketing system. Please hold tight and our administrators will be with you shortly. You can close this ticket at any time using \`-close\`.\n\n\nYou opened this ticket for the reason:\n\`\`\`${reason}\`\`\`\n**NOTE:** If you did not provide a reason, please send your reasoning for opening this ticket now.`
						);
					c.send(embed);
					// And display any errors in the console.
					const logget = db
						.prepare(
							`SELECT log FROM ticketConfig WHERE guildid = ${
								message.guild.id
							};`
						)
						.get();
					if (!logget) {
						return;
					}
					else {
						const logchan = message.guild.channels.cache.find(
							chan => chan.id === logget.log
						);
						if (!logchan) return;
						const loggingembed = new MessageEmbed()
							.setColor(color)
							.setDescription(
								`${message.author} has opened a new ticket \`#${c.name}\``
							);
						logchan.send(loggingembed);
					}
				})
				.catch(console.error);
		}
		else {
			const newTicket = db.prepare(
				'INSERT INTO tickets (guildid, ticketid, authorid, reason) values (@guildid, @ticketid, @authorid, @reason);'
			);
			newTicket.run({
				guildid: message.guild.id,
				ticketid: randomString,
				authorid: message.author.id,
				reason: reason,
			});
			const ticategory = id.category;

			const role =
				message.guild.roles.cache.find(x => x.name === 'Support Team') ||
				message.guild.roles.cache.find(r => r.id === suppRole.role);
			if (!role) {
				message.channel.send(
					`I could not find the \`Support Team\` role!\nIf you use a custom role, I recommend running the command again \`${prefix}config ticket role <@role>\``
				);
				return;
			}
			const role2 = message.channel.guild.roles.everyone;
			// Create the channel with the name "ticket-" then the user's ID.
			message.guild.channels
				.create(`ticket-${nickName}-${randomString}`, {
					permissionOverwrites: [
						{
							id: role.id,
							allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
						},
						{
							id: role2.id,
							deny: 'VIEW_CHANNEL',
						},
						{
							id: message.author.id,
							allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
						},
					],
				})
				.then(async c => {
					const updateTicketChannel = db.prepare(
						`UPDATE tickets SET chanid = (@chanid) WHERE guildid = ${
							message.guild.id
						} AND ticketid = (@ticketid)`
					);
					updateTicketChannel.run({
						chanid: c.id,
						ticketid: randomString,
					});
					await c.setParent(ticategory);
					// Send a message saying the ticket has been created.
					const newTicketE = new MessageEmbed()
						.setColor('36393F')
						.setDescription(`${language.tickets.ticketCreated}, <#${c.id}>.`);
					message.channel.send(newTicketE).then(msg =>
						msg.delete({
							timeout: 5000,
						})
					);
					message.delete({
						timeout: 5000,
					});
					const embed = new MessageEmbed()
						.setColor(0xcf40fa)
						.setTitle('New Ticket')
						.setDescription(
							`Hello \`${
								message.author.tag
							}\`! Welcome to our support ticketing system. Please hold tight and our administrators will be with you shortly. \n\n\nYou opened this ticket for the reason:\n\`\`\`${reason}\`\`\`\n**NOTE:** If you did not provide a reason, please send your reasoning for opening this ticket now.`
						);
					c.send(embed);
					// And display any errors in the console.
					const logget = db
						.prepare(
							`SELECT log FROM ticketConfig WHERE guildid = ${
								message.guild.id
							};`
						)
						.get();
					if (!logget) {
						return;
					}
					else {
						const logchan = message.guild.channels.cache.find(
							chan => chan.id === logget.log
						);
						if (!logchan) return;
						const loggingembed = new MessageEmbed()
							.setColor(color)
							.setDescription(
								`${message.author} has opened a new ticket \`#${c.name}\``
							);
						logchan.send(loggingembed);
					}
				})
				.catch(console.error);
		}
	},
};