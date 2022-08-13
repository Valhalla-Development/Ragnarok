const Command = require('../../Structures/Command');
const { EmbedBuilder } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const { MessageButton, MessageActionRow } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Posts an embed where users can create a ticket with a click of a button!',
			category: 'Ticket',
			userPerms: ['ManageMessages'],
			botPerms: ['ManageChannels']
		});
	}

	async run(message, args) {
		this.client.utils.messageDelete(message, 0);

		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const suppRole = db.prepare(`SELECT role FROM ticketConfig WHERE guildid = ${message.guild.id}`).get();

		// "Support" role
		if (!message.guild.roles.cache.find((r) => r.name === 'Support Team') && !suppRole) {
			this.client.utils.messageDelete(message, 10000);

			const nomodRole = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - TicketEmbed**`,
					value: `**◎ Error:** This server doesn't have a \`Support Team\` role made, so the ticket can't be opened.\nIf you are an administrator, you can run the command \`${prefix}config ticket role @role\`, alternatively, you can create the role with that name \`Support Team\` and give it to users that should be able to see tickets.` });
			message.channel.send({ embeds: [nomodRole] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		let modRole;
		if (message.guild.roles.cache.find((supId) => supId.id === suppRole.role)) {
			modRole = message.guild.roles.cache.find((supId) => supId.id === suppRole.role);
		} else if (message.guild.roles.cache.find((supNa) => supNa.name === 'Support Team')) {
			modRole = message.guild.roles.cache.find((supNa) => supNa.name === 'Support Team');
		} else {
			this.client.utils.messageDelete(message, 10000);

			const nomodRole = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - TicketEmbed**`,
					value: `**◎ Error:** This server doesn't have a \`Support Team\` role made, so the ticket can't be opened.\nIf you are an administrator, you can run the command \`${prefix}config ticket role @role\`, alternatively, you can create the role with that name \`Support Team\` and give it to users that should be able to see tickets.` });
			message.channel.send({ embeds: [nomodRole] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
		if (!message.member.roles.cache.has(modRole.id) && message.author.id !== message.guild.ownerID) {
			this.client.utils.messageDelete(message, 10000);

			const donthaveRole = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - TicketEmbed**`,
					value: `**◎ Error:** Sorry! You do not have the **${modRole}** role.` });
			message.channel.send({ embeds: [donthaveRole] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const embed = new EmbedBuilder()
			.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
			.setTitle('Create a Ticket')
			.setDescription('By clicking the button, a ticket will be opened for you.')
			.setFooter({ text: 'Ragnarok Bot', iconURL: this.client.user.avatarURL() });

		const button = new MessageButton()
			.setStyle('SUCCESS')
			.setLabel('📩 Open a ticket 📩')
			.setCustomId('createTicket');

		const row = new MessageActionRow()
			.addComponents(button);

		const foundtEmbed = db.prepare(`SELECT * FROM ticketConfig WHERE guildid=${message.guild.id}`).get();
		if (!foundtEmbed) {
			const disabledTic = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - TicketEmbed**`,
					value: `**◎ Error:** Tickets are not enabled on this server!` });
			message.channel.send({ embeds: [disabledTic] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const checkEmbedEx = db.prepare(`SELECT ticketembed FROM ticketConfig WHERE guildid = ${message.guild.id}`).get();
		if (checkEmbedEx) {
			if (args[0] === 'clear') {
				if (checkEmbedEx.ticketembed) {
					const update = db.prepare('UPDATE ticketconfig SET ticketembed = (@ticketembed), ticketembedchan = (@ticketEChan) WHERE guildid = (@guildid);');
					update.run({
						guildid: `${message.guild.id}`,
						ticketembed: null,
						ticketEChan: null
					});
					const cleared = new EmbedBuilder()
						.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
						.addFields({ name: `**${this.client.user.username} - TicketEmbed**`,
							value: `**◎ Success:** Tickets embed has been cleared from the database.` });
					message.channel.send({ embeds: [cleared] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
				const danelSucc = new EmbedBuilder()
					.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
					.addFields({ name: `**${this.client.user.username} - TicketEmbed**`,
						value: `**◎ Error:** I found no embed data in the database!` });
				message.channel.send({ embeds: [danelSucc] }).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (checkEmbedEx.ticketembed === null) {
				await message.channel.send({ components: [row], embeds: [embed] }).then(async (a) => {
					const update = db.prepare(
						'UPDATE ticketConfig SET ticketembed = (@ticketembed), ticketembedchan = (@ticketEChan) WHERE guildid = (@guildid);'
					);
					update.run({
						guildid: `${message.guild.id}`,
						ticketembed: `${a.id}`,
						ticketEChan: `${message.channel.id}`
					});
					return;
				});
			} else {
				try {
					const embedChannel = message.guild.channels.cache.find((channel) => channel.id === foundtEmbed.ticketembedchan);
					await embedChannel.messages.fetch(foundtEmbed.ticketembed).then((res) => {
						if (res) {
							const alreadytick = new EmbedBuilder()
								.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
								.addFields({ name: `**${this.client.user.username} - TicketEmbed**`,
									value: `**◎ Error:** You already have a Ticket embed in this server!\n Please delete the other, or clear it from the database via \`${prefix}tembed clear\`` });
							message.channel.send({ embeds: [alreadytick] }).then((m) => this.client.utils.deletableCheck(m, 10000));
							return;
						}
					}).catch(() => {
						message.channel.send({ components: [row], embeds: [embed] }).then(async (a) => {
							const update = db.prepare(
								'UPDATE ticketConfig SET ticketembed = (@ticketembed), ticketembedchan = (@ticketEChan) WHERE guildid = (@guildid);'
							);
							update.run({
								guildid: `${message.guild.id}`,
								ticketembed: `${a.id}`,
								ticketEChan: `${message.channel.id}`
							});
							return;
						});
					});
				} catch (err) {
					message.channel.send({ components: [row], embeds: [embed] }).then(async (a) => {
						const update = db.prepare(
							'UPDATE ticketConfig SET ticketembed = (@ticketembed), ticketembedchan = (@ticketEChan) WHERE guildid = (@guildid);'
						);
						update.run({
							guildid: `${message.guild.id}`,
							ticketembed: `${a.id}`,
							ticketEChan: `${message.channel.id}`
						});
						return;
					});
				}
			}
		}
	}

};
