const Command = require('../../Structures/Command');
const { EmbedBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle, OverwriteType, ChannelType } = require('discord.js');
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
			botPerms: ['ManageChannels']
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		// Ticket Embed
		const fetch = db.prepare(`SELECT * FROM ticketConfig WHERE guildid = ${message.guild.id}`).get();
		if (!fetch) {
			const alreadyTicket = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Ticket**`,
					value: `**◎ Error:** No ticket configuration found.\n\nPlease ask an administrator to set up the ticket system.` });
			message.reply({ embeds: [alreadyTicket], ephemeral: true });
			return;
		}

		if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
			const botPerm = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Ticket**`,
					value: `**◎ Error:** It seems you have removed the \`Manage Channels\` permission from me. I cannot function properly without it :cry:` });
			message.reply({ embeds: [botPerm], ephemeral: true });
			return;
		}

		// "Support" role
		if (!fetch.role) {
			const nomodRole = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Ticket**`,
					value: `**◎ Error:** This server doesn't have a \`Support Team\` role made, so the ticket can't be opened.\nIf you are an administrator, you can run the command \`${prefix}config ticket role @role\`` });
			message.reply({ embeds: [nomodRole], ephemeral: true });
			return;
		}

		// Make sure this is the user's only ticket.
		const foundTicket = db.prepare(`SELECT authorid FROM tickets WHERE guildid = ${message.guild.id} AND authorid = (@authorid)`);
		const checkTicketEx = db.prepare(`SELECT chanid FROM tickets WHERE guildid = ${message.guild.id} AND authorid = ${message.author.id}`).get();

		if (checkTicketEx) {
			if (checkTicketEx.chanid === null) {
				db.prepare(`DELETE FROM tickets WHERE guildid = ${message.guild.id} AND authorid = ${message.author.id}`).run();
			}
			if (!message.guild.channels.cache.find((ch) => ch.id === checkTicketEx.chanid)) {
				db.prepare(`DELETE FROM tickets WHERE guildid = ${message.guild.id} AND authorid = ${message.author.id}`).run();
			}
		}

		if (fetch.role) {
			if (!message.guild.roles.cache.find((role) => role.id === fetch.role)) {
				const updateRole = db.prepare(`UPDATE ticketConfig SET role = (@role) WHERE guildid = ${message.guild.id}`);
				updateRole.run({
					role: null
				});
			}
		}

		// Already has a ticket
		if (foundTicket.get({ authorid: message.author.id })) {
			try {
				const cha = message.guild.channels.cache.get(checkTicketEx.chanid);
				const alreadyTicket = new EmbedBuilder()
					.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
					.addFields({ name: `**${this.client.user.username} - Ticket**`,
						value: `**◎ Error:** It seems you already have a ticket open. | ${cha}` });
				message.reply({ embeds: [alreadyTicket], ephemeral: true });
				return;
			} catch (e) {
				console.log(e);
				return;
			}
		}

		// Make Ticket
		const id = db.prepare(`SELECT category FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
		const reason = args.slice(0).join(' ') || '';
		const randomString = nanoid();
		const nickName = message.guild.members.cache.get(message.author.id).displayName;

		const newTicket = db.prepare('INSERT INTO tickets (guildid, ticketid, authorid, reason) values (@guildid, @ticketid, @authorid, @reason);');
		newTicket.run({
			guildid: message.guild.id,
			ticketid: randomString,
			authorid: message.author.id,
			reason
		});

		let ticategory;
		if (message.guild.channels.cache.find((chan) => chan.id === id.category)) {
			ticategory = id.category;
		} else {
			const deleteCat = db.prepare(`UPDATE ticketConfig SET category = (@category) WHERE guildid = ${message.guild.id}`);
			deleteCat.run({
				category: null
			});
		}

		// Create the channel with the name "ticket-" then the user's ID.
		const role = message.guild.roles.cache.find((r) => r.id === fetch.role);
		const role2 = message.channel.guild.roles.everyone;

		// Check how many channels are in the category
		const category = message.guild.channels.cache.find((chan) => chan.id === id.category);
		const categoryLength = category && category.children.cache.size ? category.children.cache.size : 0;

		let newId;
		// Check if the category has the max amount of channels
		if (categoryLength >= 4) {
			// Clone the category
			await category.clone({ name: `${category.name}`, reason: 'max channels per category reached' }).then((chn) => {
				chn.setParent(category.parentId);
				chn.setPosition(category.rawPosition + 1);

				newId = chn.id;

				// Update the database
				const update = db.prepare('UPDATE ticketConfig SET category = (@category) WHERE guildid = (@guildid);');
				update.run({
					guildid: `${message.guild.id}`,
					category: `${chn.id}`
				});
			});
		}

		message.guild.channels.create({
			name: `ticket-${nickName}-${randomString}`,
			type: ChannelType.GuildText,
			parent: newId || (ticategory || null),
			permissionOverwrites: [
				{
					id: role.id,
					allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
					type: OverwriteType.Role
				},
				{
					id: role2.id,
					deny: PermissionsBitField.Flags.ViewChannel,
					type: OverwriteType.Role
				},
				{
					id: message.author.id,
					allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
					type: OverwriteType.Member
				},
				{
					id: this.client.user.id,
					allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
					type: OverwriteType.Member
				}
			]
		}).then((c) => {
			const updateTicketChannel = db.prepare(`UPDATE tickets SET chanid = (@chanid) WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`);
			updateTicketChannel.run({
				chanid: c.id,
				ticketid: randomString
			});
			const newTicketE = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Ticket**`,
					value: `**◎ Success:** Your ticket has been created, <#${c.id}>.` });
			message.reply({ embeds: [newTicketE], ephemeral: true });

			const buttonClose = new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel('🔒 Close')
				.setCustomId('closeTicket');

			const buttonCloseReason = new ButtonBuilder()
				.setStyle(ButtonStyle.Danger)
				.setLabel('🔒 Close With Reason')
				.setCustomId('closeTicketReason');

			const row = new ActionRowBuilder()
				.addComponents(buttonClose, buttonCloseReason);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.setTitle(`New Ticket`)
				.setDescription(`Welcome to our support system ${message.author.user}.\nPlease hold tight and a support member will be with you shortly.${reason ? `\n\n\nYou opened this ticket for the following reason:\n\`\`\`${reason}\`\`\`` : '\n\n\n**Please specify a reason for opening this ticket.**'}`);
			c.send({ components: [row], embeds: [embed] });

			if (id) {
				if (!fetch.log) {
					return;
				}

				const logchan = message.guild.channels.cache.find((chan) => chan.id === fetch.log);
				if (!logchan) return;

				const openEpoch = Math.floor(new Date().getTime() / 1000);

				const logEmbed = new EmbedBuilder()
					.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
					.setAuthor({ name: 'Ticket Opened', iconURL: message.guild.iconURL({ dynamic: true }) })
					.addFields({ name: `<:ticketId:998229977004781618> **Ticket ID**`,
						value: `[${randomString}](https://discord.com/channels/${message.guild.id}/${c.id})`, inline: true },
					{ name: `<:ticketOpen:998229978267258881> **Opened By**`,
						value: `${message.author}`, inline: true },
					{ name: `<:ticketCloseTime:998229975931048028> **Time Opened**`,
						value: `<t:${openEpoch}>`, inline: true },
					{ name: `🖋️ **Reason**`,
						value: `${reason || 'No reason provided.'}`, inline: true })
					.setTimestamp();
				logchan.send({ embeds: [logEmbed] });
			}
		}).catch(console.error);
	}

};
