const Command = require('../../Structures/Command');
const { MessageEmbed, Permissions } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 7);

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['open'],
			description: 'Creates a private ticket.',
			category: 'Ticket',
			botPerms: ['MANAGE_CHANNELS']
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const suppRole = db.prepare(`SELECT role FROM ticketConfig WHERE guildid = ${message.guild.id}`).get();

		if (!message.member.guild.me.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
			this.client.utils.messageDelete(message, 10000);

			const botPerm = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - New**`,
					`**◎ Error:** It seems you have removed the \`MANAGE_CHANNELS\` permission from me. I cannot function properly without it :cry:`);
			message.channel.send({ embeds: [botPerm] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// "Support" role
		if (!message.guild.roles.cache.find((r) => r.name === 'Support Team') && !suppRole) {
			this.client.utils.messageDelete(message, 10000);

			const nomodRole = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - New**`,
					`**◎ Error:** This server doesn't have a \`Support Team\` role made, so the ticket can't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`);
			message.channel.send({ embeds: [nomodRole] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
		// Make sure this is the user's only ticket.
		const foundTicket = db.prepare(`SELECT authorid FROM tickets WHERE guildid = ${message.guild.id} AND authorid = (@authorid)`);
		const checkTicketEx = db.prepare(`SELECT chanid FROM tickets WHERE guildid = ${message.guild.id} AND authorid = ${message.author.id}`).get();
		const roleCheckEx = db.prepare(`SELECT role FROM ticketConfig WHERE guildid = ${message.guild.id}`).get();
		if (checkTicketEx) {
			if (checkTicketEx.chanid === null) {
				db.prepare(`DELETE FROM tickets WHERE guildid = ${message.guild.id} AND authorid = ${message.author.id}`).run();
			}
			if (!message.guild.channels.cache.find((channel) => channel.id === checkTicketEx.chanid)) {
				db.prepare(`DELETE FROM tickets WHERE guildid = ${message.guild.id} AND authorid = ${message.author.id}`).run();
			}
		}
		if (roleCheckEx) {
			if (!message.guild.roles.cache.find((role) => role.id === roleCheckEx.role)) {
				const updateRole = db.prepare(`UPDATE ticketConfig SET role = (@role) WHERE guildid = ${message.guild.id}`);
				updateRole.run({
					role: null
				});
			}
		}
		if (foundTicket.get({
			authorid: message.author.id
		})
		) {
			this.client.utils.messageDelete(message, 10000);

			const existTM = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - New**`,
					`**◎ Error:** You already have a ticket open!`);
			message.channel.send({ embeds: [existTM] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const nickName = message.guild.members.cache.get(message.author.id).displayName;

		// Make Ticket
		const id = db.prepare(`SELECT category FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
		const reason = args.slice(0).join(' ') || 'No reason provided.';
		const randomString = nanoid();
		if (!id) {
			const newTicket = db.prepare('INSERT INTO tickets (guildid, ticketid, authorid, reason) values (@guildid, @ticketid, @authorid, @reason);');
			newTicket.run({
				guildid: message.guild.id,
				ticketid: randomString,
				authorid: message.author.id,
				reason
			});
			// Create the channel with the name "ticket-" then the user's ID.
			const role = message.guild.roles.cache.find((x) => x.name === 'Support Team') || message.guild.roles.cache.find((r) => r.id === suppRole.role);
			if (!role) {
				message.channel.send(`I could not find the \`Support Team\` role!\nIf you use a custom role, I recommend running the command again \`${prefix}config ticket role <@role>\``);
				return;
			}
			const role2 = message.channel.guild.roles.everyone;
			message.guild.channels.create(`ticket-${nickName}-${randomString}`, {
				permissionOverwrites: [
					{
						id: role.id,
						allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
					},
					{
						id: role2.id,
						deny: 'VIEW_CHANNEL'
					},
					{
						id: message.author.id,
						allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
					}
				]
			}).then((c) => {
				const updateTicketChannel = db.prepare(`UPDATE tickets SET chanid = (@chanid) WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`);
				updateTicketChannel.run({
					chanid: c.id,
					ticketid: randomString
				});
				// Send a message saying the ticket has been created.
				this.client.utils.messageDelete(message, 10000);

				const newTicketE = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - New**`,
						`**◎ Success:** Your ticket has been created, <#${c.id}>.`);
				message.channel.send({ embeds: [newTicketE] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setTitle('New Ticket')
					.setDescription(`Hello \`${message.author.tag}\`! Welcome to our support ticketing system. Please hold tight and our administrators will be with you shortly. You can close this ticket at any time using \`-close\`.\n\n\nYou opened this ticket for the reason:\n\`\`\`${reason}\`\`\`\n**NOTE:** If you did not provide a reason, please send your reasoning for opening this ticket now.`);
				c.send({ embeds: [embed] });
				// And display any errors in the console.
				const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
				if (!logget) {
					return;
				}
				const logchan = message.guild.channels.cache.find((chan) => chan.id === logget.log);
				if (!logchan) return;
				const loggingembed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - New**`,
						`**◎ Ticket Created:** ${message.author} has opened a new ticket \`#${c.name}\`\nReason: \`${reason}\``);
				logchan.send({ embeds: [loggingembed] });
			}).catch(console.error);
		} else {
			const newTicket = db.prepare('INSERT INTO tickets (guildid, ticketid, authorid, reason) values (@guildid, @ticketid, @authorid, @reason);');
			newTicket.run({
				guildid: message.guild.id,
				ticketid: randomString,
				authorid: message.author.id,
				reason
			});
			const ticategory = id.category;

			const role = message.guild.roles.cache.find((x) => x.name === 'Support Team') || message.guild.roles.cache.find((r) => r.id === suppRole.role);
			if (!role) {
				this.client.utils.messageDelete(message, 10000);

				const nomodRole = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - New**`,
						`**◎ Error:** I could not find the \`Support Team\` role!\nIf you use a custom role, I recommend running the command again \`${prefix}config ticket role <@role>\``);
				message.channel.send({ embeds: [nomodRole] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			const role2 = message.channel.guild.roles.everyone;
			// Create the channel with the name "ticket-" then the user's ID.
			message.guild.channels.create(`ticket-${nickName}-${randomString}`, {
				parent: ticategory,
				permissionOverwrites: [
					{
						id: role.id,
						allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
					},
					{
						id: role2.id,
						deny: 'VIEW_CHANNEL'
					},
					{
						id: message.author.id,
						allow: ['VIEW_CHANNEL', 'SEND_MESSAGES']
					}
				]
			}).then(async (c) => {
				const updateTicketChannel = db.prepare(`UPDATE tickets SET chanid = (@chanid) WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`);
				updateTicketChannel.run({
					chanid: c.id,
					ticketid: randomString
				});
				this.client.utils.messageDelete(message, 10000);

				// Send a message saying the ticket has been created.
				const newTicketE = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - New**`,
						`**◎ Success:** Your ticket has been created, <#${c.id}>.`);
				message.channel.send({ embeds: [newTicketE] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setTitle('New Ticket')
					.setDescription(`Hello \`${message.author.tag}\`! Welcome to our support ticketing system. Please hold tight and our administrators will be with you shortly. \n\n\nYou opened this ticket for the reason:\n\`\`\`${reason}\`\`\`\n**NOTE:** If you did not provide a reason, please send your reasoning for opening this ticket now.`);
				c.send({ embeds: [embed] });
				// And display any errors in the console.
				const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
				if (!logget) {
					return;
				}

				const logchan = message.guild.channels.cache.find((chan) => chan.id === logget.log);
				if (!logchan) return;
				const loggingembed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - New**`,
						`**◎ Ticket Created:** ${message.author} has opened a new ticket \`#${c.name}\`\nReason: \`${reason}\``);
				logchan.send({ embeds: [loggingembed] });
			}).catch(console.error);
		}
	}

};
