const Event = require('../../Structures/Event');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const { Permissions, MessageEmbed } = require('discord.js');
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 7);

module.exports = class extends Event {

	async run(button) {
		await button.defer();

		if (button.id === 'createTicket') {
			// Ticket Embed
			const guild = this.client.guilds.cache.get(button.guild.id);
			const fetch = db.prepare(`SELECT * FROM ticketConfig WHERE guildid = ${guild.id}`).get();
			const channel = guild.channels.cache.get(fetch.ticketembedchan);

			if (!fetch.ticketembed) {
				button.message.delete();
				return;
			}

			if (!guild.me.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
				const botPerm = new MessageEmbed()
					.setColor(this.client.utils.color(guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ticket**`,
						`**◎ Error:** It seems you have removed the \`MANAGE_CHANNELS\` permission from me. I cannot function properly without it :cry:`);
				channel.send({ embed: botPerm }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			// "Support" role
			if (!guild.roles.cache.find((r) => r.name === 'Support Team') && !fetch.role) {
				const nomodRole = new MessageEmbed()
					.setColor(this.client.utils.color(guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ticket**`,
						`**◎ Error:** This server doesn't have a \`Support Team\` role made, so the ticket can't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`);
				channel.send({ embed: nomodRole }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			// Make sure this is the user's only ticket.
			await button.clicker.fetch();
			const foundTicket = db.prepare(`SELECT authorid FROM tickets WHERE guildid = ${guild.id} AND authorid = (@authorid)`);
			const checkTicketEx = db.prepare(`SELECT chanid FROM tickets WHERE guildid = ${guild.id} AND authorid = ${button.clicker.user.id}`).get();

			if (checkTicketEx) {
				if (checkTicketEx.chanid === null) {
					db.prepare(`DELETE FROM tickets WHERE guildid = ${guild.id} AND authorid = ${button.clicker.user.id}`).run();
				}
				if (!guild.channels.cache.find((ch) => ch.id === checkTicketEx.chanid)) {
					db.prepare(`DELETE FROM tickets WHERE guildid = ${guild.id} AND authorid = ${button.clicker.user.id}`).run();
				}
			}

			if (fetch.role) {
				if (!guild.roles.cache.find((role) => role.id === fetch.role)) {
					const updateRole = db.prepare(`UPDATE ticketConfig SET role = (@role) WHERE guildid = ${guild.id}`);
					updateRole.run({
						role: null
					});
				}
			}

			// Already has a ticket
			if (foundTicket.get({ authorid: button.clicker.user.id })) {
				try {
					const cha = guild.channels.cache.get(checkTicketEx.chanid);
					const alreadyTicket = new MessageEmbed()
						.setColor(this.client.utils.color(guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Ticket**`,
							`**◎ Error:** It seems you already have a ticket open. | ${cha}`);
					button.clicker.user.send({ embed: alreadyTicket });
					return;
				} catch {
					return;
				}
			}

			// Make Ticket
			const id = db.prepare(`SELECT category FROM ticketConfig WHERE guildid = ${guild.id};`).get();
			const reason = 'No reason provided.';
			const randomString = nanoid();
			const nickName = guild.members.cache.get(button.clicker.user.id).displayName;

			const newTicket = db.prepare('INSERT INTO tickets (guildid, ticketid, authorid, reason) values (@guildid, @ticketid, @authorid, @reason);');
			newTicket.run({
				guildid: guild.id,
				ticketid: randomString,
				authorid: button.clicker.user.id,
				reason
			});
			// Create the channel with the name "ticket-" then the user's ID.
			const role = button.guild.roles.cache.find((x) => x.name === 'Support Team') || button.guild.roles.cache.find((r) => r.id === fetch.role);
			const role2 = channel.guild.roles.everyone;
			button.guild.channels.create(`ticket-${nickName}-${randomString}`, {
				permissionOverwrites: [
					{
						id: role.id,
						allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
					},
					{
						id: role2.id,
						deny: Permissions.FLAGS.VIEW_CHANNEL
					},
					{
						id: button.clicker.user.id,
						allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.SEND_MESSAGES]
					}
				]
			}).then((c) => {
				const updateTicketChannel = db.prepare(`UPDATE tickets SET chanid = (@chanid) WHERE guildid = ${guild.id} AND ticketid = (@ticketid)`);
				updateTicketChannel.run({
					chanid: c.id,
					ticketid: randomString
				});
				const newTicketE = new MessageEmbed()
					.setColor(this.client.utils.color(button.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ticket**`,
						`**◎ Success:** Your ticket has been created, <#${c.id}>.`);
				channel.send({ embed: newTicketE }).then((m) => this.client.utils.deletableCheck(m, 4000));
				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(button.guild.me.displayHexColor))
					.setTitle('New Ticket')
					.setDescription(`Hello \`${button.clicker.user.tag}\`! Welcome to our support ticketing system. Please hold tight and our administrators will be with you shortly. You can close this ticket at any time using \`-close\`.\n\n\nYou opened this ticket for the reason:\n\`\`\`${reason}\`\`\`\n**NOTE:** If you did not provide a reason, please send your reasoning for opening this ticket now.`);
				c.send({ embed: embed });

				if (id) {
					if (!fetch.log) {
						return;
					}

					const logchan = guild.channels.cache.find((chan) => chan.id === fetch.log);
					if (!logchan) return;
					const loggingembed = new MessageEmbed()
						.setColor(this.client.utils.color(guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Ticket**`,
							`**◎ Ticket Created:** ${button.clicker.user} has opened a new ticket \`#${c.name}\`\nReason: \`${reason}\``);
					logchan.send({ embed: loggingembed });
				}
			}).catch(console.error);
		}
	}

};
