const Command = require('../../Structures/Command');
const { EmbedBuilder } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const comCooldown = new Set();
const comCooldownSeconds = 20;
const { MessageButton, MessageActionRow } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');
const fetch = require('node-fetch-cjs');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Closes the ticket.',
			category: 'Ticket',
			botPerms: ['ManageChannels']
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const channelArgs = message.channel.name.split('-');
		const foundTicket = db.prepare(`SELECT * FROM tickets WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`).get({
			ticketid: channelArgs[channelArgs.length - 1]
		});
		const closeReason = args.slice(0).join(' ');

		// Make sure it's inside the ticket channel.
		if (foundTicket && message.channel.id !== foundTicket.chanid) {
			this.client.utils.messageDelete(message, 10000);

			const badChannel = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addField(`**${this.client.user.username} - Close**`,
					`**◎ Error:** You can't use the close command outside of a ticket channel.`);
			message.channel.send({ embeds: [badChannel] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
		if (!foundTicket) {
			this.client.utils.messageDelete(message, 10000);

			const errEmbed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addField(`**${this.client.user.username} - Close**`,
					`**◎ Error:** You can't use the close command outside of a ticket channel.`);
			message.channel.send({ embeds: [errEmbed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const suppRole = db.prepare(`SELECT role FROM ticketConfig WHERE guildid = ${message.guild.id}`).get();

		let modRole;
		if (message.guild.roles.cache.find((supId) => supId.id === suppRole.role)) {
			modRole = message.guild.roles.cache.find((supId) => supId.id === suppRole.role);
		} else if (message.guild.roles.cache.find((supNa) => supNa.name === 'Support Team')) {
			modRole = message.guild.roles.cache.find((supNa) => supNa.name === 'Support Team');
		} else {
			this.client.utils.messageDelete(message, 10000);

			const nomodRole = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addField(`**${this.client.user.username} - Close**`,
					`**◎ Error:** This server doesn't have a \`Support Team\` role made, so the ticket can't be opened.\nIf you are an administrator, you can run the command \`${prefix}config ticket role @role\`, alternatively, you can create the role with that name \`Support Team\` and give it to users that should be able to see tickets.`);
			message.channel.send({ embeds: [nomodRole] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
		if (!message.member.roles.cache.has(modRole.id) && message.author.id !== message.guild.ownerID) {
			this.client.utils.messageDelete(message, 10000);

			const donthaveRole = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addField(`**${this.client.user.username} - Close**`,
					`**◎ Error:** Sorry! You do not have the **${modRole}** role.`);
			message.channel.send({ embeds: [donthaveRole] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!comCooldown.has(message.author.id)) {
			const buttonA = new MessageButton()
				.setStyle('SUCCESS')
				.setLabel('Close')
				.setCustomId('close');

			const buttonB = new MessageButton()
				.setStyle('DANGER')
				.setLabel('Cancel')
				.setCustomId('cancel');

			const row = new MessageActionRow()
				.addComponents(buttonA, buttonB);

			const initial = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addField(`**${this.client.user.username} - Close**`,
					`**◎ Confirmation:** Are you sure? Once confirmed, you cannot reverse this action!`);

			const m = await message.channel.send({ components: [row], embeds: [initial] });

			const filter = (but) => but.user.id === message.author.id;

			const collector = m.createMessageComponentCollector({ filter: filter, time: 15000 });

			if (!comCooldown.has(message.author.id)) {
				comCooldown.add(message.author.id);
			}
			setTimeout(() => {
				if (comCooldown.has(message.author.id)) {
					comCooldown.delete(message.author.id);
				}
			}, comCooldownSeconds * 1000);

			collector.on('collect', async b => {
				await b.deferUpdate();

				if (b.customId === 'close') {
					message.channel.sendTyping();
					const embed = new EmbedBuilder()
						.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
						.addField(`**${this.client.user.username} - Ticket**`,
							`Please stand-by while I gather all messages. This may take a while dependant on how many messages are in this channel.`);
					message.channel.send({ embeds: [embed] });

					// Generate random string
					const random = (length = 40) => {
						// Declare all characters
						const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

						// Pick characers randomly
						let str = '';
						for (let i = 0; i < length; i++) {
							str += chars.charAt(Math.floor(Math.random() * chars.length));
						}

						return str;
					};

					const staticFileNameGen = random();
					const staticFileName = `${message.channel.name}-_-${staticFileNameGen}.html`;
					const { channel } = message;

					channel.name = staticFileName;

					const fixedName = message.channel.name.substr(0, message.channel.name.indexOf('-_-'));

					const attachment = await discordTranscripts.createTranscript(channel, {
						limit: -1,
						returnBuffer: true,
						saveImages: true,
						fileName: staticFileName
					});
					const buffered = Buffer.from(attachment).toString();

					const authorizationSecret = 'pmzg!SD#9H8E#PzGMhe5dr&Qo5EQReLy@cqf87QB';

					const response = await fetch.default('https://www.ragnarokbot.com/index.php', {
						method: 'POST',
						body: buffered,
						headers: { 'X-Auth': authorizationSecret }
					});

					const data = await response.status;

					let transLinkText;
					let openTranscript;
					let transcriptRow;

					if (data !== 200) {
						transLinkText = `\`Unavailable\``;
					} else {
						transLinkText = `[**Click Here**](https://www.ragnarokbot.com/transcripts/${staticFileName})`;
						// Transcript button
						openTranscript = new MessageButton()
							.setStyle('LINK')
							.setEmoji('<:ticketTranscript:998229979609440266>')
							.setLabel('View Transcript')
							.setURL(`https://www.ragnarokbot.com/transcripts/${staticFileName}`);

						transcriptRow = new MessageActionRow()
							.addComponents(openTranscript);
					}

					if (message.channel) {
						channel.name = fixedName;
						message.channel.delete();
					}

					const deleteTicket = db.prepare(`DELETE FROM tickets WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`);
					deleteTicket.run({
						ticketid: channelArgs[channelArgs.length - 1]
					});

					const epoch = Math.floor(new Date().getTime() / 1000);

					const user = this.client.users.cache.find((a) => a.id === foundTicket.authorid);
					if (user) {
						if (!closeReason) {
							const dmE = new EmbedBuilder()
								.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
								.setAuthor({ name: 'Ticket Closed', iconURL: message.guild.iconURL({ dynamic: true }) })
								.addFields({ name: `<:ticketId:998229977004781618> **Ticket ID**`, value: `\`${channelArgs[channelArgs.length - 1]}\``, inline: true },
									{ name: `<:ticketOpen:998229978267258881> **Opened By**`, value: `${user}`, inline: true },
									{ name: `<:ticketClose:998229974634991646> **Closed By**`, value: `${message.author}`, inline: true },
									{ name: `<:ticketTranscript:998229979609440266> **Transcript**`, value: `${transLinkText}`, inline: true },
									{ name: `<:ticketCloseTime:998229975931048028> **Time Closed**`, value: `<t:${epoch}>`, inline: true },
									{ name: `\u200b`, value: `\u200b`, inline: true })
								.setTimestamp();
							user.send(transcriptRow ? { components: [transcriptRow], embeds: [dmE] } : { embeds: [dmE] }).then(() => {
								// eslint-disable-next-line arrow-body-style
							}).catch(() => {
								if (comCooldown.has(message.author.id)) {
									comCooldown.delete(message.author.id);
								}
								return;
							});
						} else {
							const dmE = new EmbedBuilder()
								.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
								.setAuthor({ name: 'Ticket Closed', iconURL: message.guild.iconURL({ dynamic: true }) })
								.addFields({ name: `<:ticketId:998229977004781618> **Ticket ID**`, value: `\`${channelArgs[channelArgs.length - 1]}\``, inline: true },
									{ name: `<:ticketOpen:998229978267258881> **Opened By**`, value: `${user}`, inline: true },
									{ name: `<:ticketClose:998229974634991646> **Closed By**`, value: `${message.author}`, inline: true },
									{ name: `<:ticketTranscript:998229979609440266> **Transcript**`, value: `${transLinkText}`, inline: true },
									{ name: `<:ticketCloseTime:998229975931048028> **Time Closed**`, value: `<t:${epoch}>`, inline: true },
									{ name: `\u200b`, value: `\u200b`, inline: true },
									{ name: `🖋️ **Reason**`, value: `${closeReason}` })
								.setTimestamp();
							user.send(transcriptRow ? { components: [transcriptRow], embeds: [dmE] } : { embeds: [dmE] }).then(() => {
								// eslint-disable-next-line arrow-body-style
							}).catch(() => {
								if (comCooldown.has(message.author.id)) {
									comCooldown.delete(message.author.id);
								}
								return;
							});
						}
					}

					const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
					if (!logget) {
						if (comCooldown.has(message.author.id)) {
							comCooldown.delete(message.author.id);
						}
						return;
					}

					const logchan = message.guild.channels.cache.find((chan) => chan.id === logget.log);
					if (!logchan) {
						if (comCooldown.has(message.author.id)) {
							comCooldown.delete(message.author.id);
						}
						return;
					}

					if (!closeReason) {
						const logEmbed = new EmbedBuilder()
							.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
							.setAuthor({ name: 'Ticket Closed', iconURL: message.guild.iconURL({ dynamic: true }) })
							.addFields({ name: `<:ticketId:998229977004781618> **Ticket ID**`, value: `\`${channelArgs[channelArgs.length - 1]}\``, inline: true },
								{ name: `<:ticketOpen:998229978267258881> **Opened By**`, value: `${user}`, inline: true },
								{ name: `<:ticketClose:998229974634991646> **Closed By**`, value: `${message.author}`, inline: true },
								{ name: `<:ticketTranscript:998229979609440266> **Transcript**`, value: `${transLinkText}`, inline: true },
								{ name: `<:ticketCloseTime:998229975931048028> **Time Closed**`, value: `<t:${epoch}>`, inline: true },
								{ name: `\u200b`, value: `\u200b`, inline: true })
							.setTimestamp();
						logchan.send(transcriptRow ? { components: [transcriptRow], embeds: [logEmbed] } : { embeds: [logEmbed] });
						if (comCooldown.has(message.author.id)) {
							comCooldown.delete(message.author.id);
						}
					} else {
						const logEmbed = new EmbedBuilder()
							.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
							.setAuthor({ name: 'Ticket Closed', iconURL: message.guild.iconURL({ dynamic: true }) })
							.addFields({ name: `<:ticketId:998229977004781618> **Ticket ID**`, value: `\`${channelArgs[channelArgs.length - 1]}\``, inline: true },
								{ name: `<:ticketOpen:998229978267258881> **Opened By**`, value: `${user}`, inline: true },
								{ name: `<:ticketClose:998229974634991646> **Closed By**`, value: `${message.author}`, inline: true },
								{ name: `<:ticketTranscript:998229979609440266> **Transcript**`, value: `${transLinkText}`, inline: true },
								{ name: `<:ticketCloseTime:998229975931048028> **Time Closed**`, value: `<t:${epoch}>`, inline: true },
								{ name: `\u200b`, value: `\u200b`, inline: true },
								{ name: `🖋️ **Reason**`, value: `${closeReason}` })
							.setTimestamp();
						logchan.send(transcriptRow ? { components: [transcriptRow], embeds: [logEmbed] } : { embeds: [logEmbed] });
						if (comCooldown.has(message.author.id)) {
							comCooldown.delete(message.author.id);
						}
					}
					collector.stop('close');
				}
				if (b.customId === 'cancel') {
					collector.stop('cancel');
				}
			});
			collector.on('end', (_, reason) => {
				if (comCooldown.has(message.author.id)) {
					comCooldown.delete(message.author.id);
				}

				if (reason === 'cancel' || reason === 'time') {
					this.client.utils.messageDelete(message, 0);
					this.client.utils.messageDelete(m, 0);

					const limitE = new EmbedBuilder()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
						.addField(`**${this.client.user.username} - Close**`,
							`**◎ Success:** Ticket close cancelled.`);
					message.channel.send({ embeds: [limitE] }).then((ca) => this.client.utils.deletableCheck(ca, 10000));
					return;
				}
			});
		} else {
			this.client.utils.messageDelete(message, 10000);

			const badChannel = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addField(`**${this.client.user.username} - Close**`,
					`**◎ Error:** Please only run \`${prefix}close\` once!`);
			message.channel.send({ embeds: [badChannel] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
	}

};
