const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const { MessageButton, MessageActionRow } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Posts an embed where users can create a ticket with a click of a button!',
			category: 'Ticket',
			userPerms: ['MANAGE_MESSAGES'],
			botPerms: ['MANAGE_CHANNELS']
		});
	}

	async run(message, args) {
		this.client.utils.messageDelete(message, 0);

		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setTitle('Create a Ticket')
			.setDescription('By clicking the button, a ticket will be opened for you.')
			.setFooter('Ragnarok Bot', this.client.user.avatarURL());

		const button = new MessageButton()
			.setStyle('SUCCESS')
			.setLabel('📩 Open a ticket 📩')
			.setCustomId('createTicket');

		const row = new MessageActionRow()
			.addComponents(button);

		const foundtEmbed = db.prepare(`SELECT * FROM ticketConfig WHERE guildid=${message.guild.id}`).get();
		if (!foundtEmbed) {
			const disabledTic = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - TicketEmbed**`,
					`**◎ Error:** Tickets are not enabled on this server!`);
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
					const cleared = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - TicketEmbed**`,
							`**◎ Success:** Tickets embed has been cleared from the database.`);
					message.channel.send({ embeds: [cleared] }).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
				const danelSucc = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - TicketEmbed**`,
						`**◎ Error:** I found no embed data in the database!`);
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
							const alreadytick = new MessageEmbed()
								.setColor(this.client.utils.color(message.guild.me.displayHexColor))
								.addField(`**${this.client.user.username} - TicketEmbed**`,
									`**◎ Error:** You already have a Ticket embed in this server!\n Please delete the other, or clear it from the database via \`${prefix}tembed clear\``);
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
