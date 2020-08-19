const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'E',
			aliases: ['E'],
			description: 'E',
			category: 'E',
			usage: 'E'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
			const errEmbed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField(`**${this.client.user.username} - TEmbed**`,
					`**◎ Error:** You do not have permission to run this command.`);
			message.channel.send(errEmbed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const embed = new MessageEmbed()
			.setColor('36393F')
			.setTitle('Create a Ticket')
			.setDescription('To create a ticket react with 📩')
			.setFooter('Ragnarok Bot', this.client.user.avatarURL());

		const foundtEmbed = db.prepare(`SELECT * FROM ticketConfig WHERE guildid=${message.guild.id}`).get();
		if (!foundtEmbed) {
			const disabledTic = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField(`**${this.client.user.username} - TicketEmbed**`,
					`**◎ Error:** Tickets are not enabled on this server!`);
			message.channel.send(disabledTic).then((m) => m.delete({ timeout: 15000 }));
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
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField(`**${this.client.user.username} - TicketEmbed**`,
							`**◎ Error:** Tickets embed has been cleared from the database.`);
					message.channel.send(cleared).then((m) => m.delete({ timeout: 15000 }));
					return;
				}
				const danelSucc = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField(`**${this.client.user.username} - TicketEmbed**`,
						`**◎ Error:** I found no embed data in the database!`);
				message.channel.send(danelSucc).then((m) => m.delete({ timeout: 15000, reason: 'Danel succ' }));
				return;
			}

			if (checkEmbedEx.ticketembed === null) {
				await message.channel.send(embed).then(async (a) => {
					a.react('📩');
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
								.setColor(message.guild.me.displayHexColor || '36393F')
								.addField(`**${this.client.user.username} - TicketEmbed**`,
									`**◎ Error:** You already have a Ticket embed in this server!\n Please delete the other, or clear it from the database via \`${prefix}tembed clear\``);
							message.channel.send(alreadytick).then((m) => m.delete({ timeout: 15000 }));
							return;
						}
					}).catch(() => {
						message.channel.send(embed).then(async (a) => {
							a.react('📩');
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
					message.channel.send(embed).then(async (a) => {
						a.react('📩');
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
