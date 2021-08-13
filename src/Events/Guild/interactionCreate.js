const Event = require('../../Structures/Event');
const { MessageEmbed, Permissions } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 7);

module.exports = class extends Event {

	async run(interaction) {
		if (interaction.customID === 'createTicket') {
			await interaction.deferUpdate();

			// Ticket Embed
			const guild = this.client.guilds.cache.get(interaction.guild.id);
			const fetch = db.prepare(`SELECT * FROM ticketConfig WHERE guildid = ${guild.id}`).get();
			const channel = guild.channels.cache.get(fetch.ticketembedchan);

			if (!fetch.ticketembed) {
				interaction.message.delete();
				return;
			}

			if (!guild.me.permissions.has(Permissions.FLAGS.MANAGE_CHANNELS)) {
				const botPerm = new MessageEmbed()
					.setColor(this.client.utils.color(guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ticket**`,
						`**◎ Error:** It seems you have removed the \`MANAGE_CHANNELS\` permission from me. I cannot function properly without it :cry:`);
				channel.send({ embeds: [botPerm] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			// "Support" role
			if (!guild.roles.cache.find((r) => r.name === 'Support Team') && !fetch.role) {
				const nomodRole = new MessageEmbed()
					.setColor(this.client.utils.color(guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ticket**`,
						`**◎ Error:** This server doesn't have a \`Support Team\` role made, so the ticket can't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`);
				channel.send({ embeds: [nomodRole] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			// Make sure this is the user's only ticket.
			const foundTicket = db.prepare(`SELECT authorid FROM tickets WHERE guildid = ${guild.id} AND authorid = (@authorid)`);
			const checkTicketEx = db.prepare(`SELECT chanid FROM tickets WHERE guildid = ${guild.id} AND authorid = ${interaction.user.id}`).get();

			if (checkTicketEx) {
				if (checkTicketEx.chanid === null) {
					db.prepare(`DELETE FROM tickets WHERE guildid = ${guild.id} AND authorid = ${interaction.user.id}`).run();
				}
				if (!guild.channels.cache.find((ch) => ch.id === checkTicketEx.chanid)) {
					db.prepare(`DELETE FROM tickets WHERE guildid = ${guild.id} AND authorid = ${interaction.user.id}`).run();
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
			if (foundTicket.get({ authorid: interaction.user.id })) {
				try {
					const cha = guild.channels.cache.get(checkTicketEx.chanid);
					const alreadyTicket = new MessageEmbed()
						.setColor(this.client.utils.color(guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Ticket**`,
							`**◎ Error:** It seems you already have a ticket open. | ${cha}`);
					interaction.user.send({ embeds: [alreadyTicket] });
					return;
				} catch {
					return;
				}
			}

			// Make Ticket
			const id = db.prepare(`SELECT category FROM ticketConfig WHERE guildid = ${guild.id};`).get();
			const reason = 'No reason provided.';
			const randomString = nanoid();
			const nickName = guild.members.cache.get(interaction.user.id).displayName;

			const newTicket = db.prepare('INSERT INTO tickets (guildid, ticketid, authorid, reason) values (@guildid, @ticketid, @authorid, @reason);');
			newTicket.run({
				guildid: guild.id,
				ticketid: randomString,
				authorid: interaction.user.id,
				reason
			});
			// Create the channel with the name "ticket-" then the user's ID.
			const role = interaction.guild.roles.cache.find((x) => x.name === 'Support Team') || interaction.guild.roles.cache.find((r) => r.id === fetch.role);
			const role2 = channel.guild.roles.everyone;
			interaction.guild.channels.create(`ticket-${nickName}-${randomString}`, {
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
						id: interaction.user.id,
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
					.setColor(this.client.utils.color(interaction.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ticket**`,
						`**◎ Success:** Your ticket has been created, <#${c.id}>.`);
				channel.send({ embeds: [newTicketE] }).then((m) => this.client.utils.deletableCheck(m, 4000));
				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(interaction.guild.me.displayHexColor))
					.setTitle('New Ticket')
					.setDescription(`Hello \`${interaction.user.tag}\`! Welcome to our support ticketing system. Please hold tight and our administrators will be with you shortly. You can close this ticket at any time using \`-close\`.\n\n\nYou opened this ticket for the reason:\n\`\`\`${reason}\`\`\`\n**NOTE:** If you did not provide a reason, please send your reasoning for opening this ticket now.`);
				c.send({ embeds: [embed] });

				if (id) {
					if (!fetch.log) {
						return;
					}

					const logchan = guild.channels.cache.find((chan) => chan.id === fetch.log);
					if (!logchan) return;
					const loggingembed = new MessageEmbed()
						.setColor(this.client.utils.color(guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Ticket**`,
							`**◎ Ticket Created:** ${interaction.user} has opened a new ticket \`#${c.name}\`\nReason: \`${reason}\``);
					logchan.send({ embeds: [loggingembed] });
				}
			}).catch(console.error);
		}

		if (interaction.customID === 'rolemenu') {
			await interaction.deferUpdate();

			const guild = this.client.guilds.cache.get(interaction.guild.id);
			const fetch = db.prepare(`SELECT * FROM rolemenu WHERE guildid = ${guild.id}`).get();
			const channel = guild.channels.cache.get(fetch.activeRoleMenuID.channel);
			console.log(channel.id);
		}
	}

};
