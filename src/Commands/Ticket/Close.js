const Command = require('../../Structures/Command');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const fetchAll = require('discord-fetch-all');
const comCooldown = new Set();
const comCooldownSeconds = 20;
const { MessageButton, MessageActionRow } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Closes the ticket.',
			category: 'Ticket',
			botPerms: ['MANAGE_CHANNELS']
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

			const badChannel = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Close**`,
					`**◎ Error:** You can't use the close command outside of a ticket channel.`);
			message.channel.send({ embeds: [badChannel] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
		if (!foundTicket) {
			this.client.utils.messageDelete(message, 10000);

			const errEmbed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Close**`,
					`**◎ Error:** You can't use the close command outside of a ticket channel.`);
			message.channel.send({ embeds: [errEmbed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!comCooldown.has(message.author.id)) {
			message.channel.sendTyping();

			const user = this.client.users.cache.find((a) => a.id === foundTicket.authorid); // do something if the user is not found (they left)

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

			const initial = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Close**`,
					`**◎ Confirmation:** Are you sure? Once confirmed, you cannot reverse this action!`)
				.setFooter({ text: `If this fails for any reason, you can forcefully close with: ${prefix}forceclose` });

			const m = await message.channel.send({ components: [row], embeds: [initial] });

			const filter = (but) => but.user.id === message.author.id;

			const collector = m.createMessageComponentCollector(filter, { time: 15000 });

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
					const embed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Ticket**`,
							`Please stand-by while I gather all messages. This may take a while dependant on how many messages are in this channel.\n\n**NOTE** If this is taking too long, I may have timed out, you can run \`${prefix}forceclose\` to close the ticket forcefully, this will not include a chat log.`);
					message.channel.send({ embeds: [embed] });

					const allMessages = await fetchAll.messages(message.channel, {
						reverseArray: true,
						userOnly: false,
						botOnly: false,
						pinnedOnly: false
					});

					const mapfile = allMessages.map(e => ({ time: new Date(e.createdTimestamp).toUTCString(), username: e.author.username, message: e.content }));
					const file = mapfile.filter((f) => f.message !== '');
					file.unshift({ tickeData: `Ticket Creator: ${user.username} || Ticket Reason: ${foundTicket.reason}` });

					const toString = JSON.stringify(file, null, 3);
					const buffer = Buffer.from(toString);
					const attachment = new MessageAttachment(buffer, `ticketLog.json`);

					if (message.channel) {
						message.channel.delete();
					}
					const deleteTicket = db.prepare(`DELETE FROM tickets WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`);
					deleteTicket.run({
						ticketid: channelArgs[channelArgs.length - 1]
					});

					if (!closeReason) {
						user.send({ content: `Your ticket in guild: \`${message.guild.name}\` was closed.\nI have attached the chat transcript.`, files: [attachment] }).then(() => {
						// eslint-disable-next-line arrow-body-style
						}).catch(() => {
							if (comCooldown.has(message.author.id)) {
								comCooldown.delete(message.author.id);
							}
							return;
						});
					} else {
						user.send({ content: `Your ticket in guild: \`${message.guild.name}\` was closed for the following reason:\n\`${closeReason}\`\nI have attached the chat transcript.`, files: [attachment] }).then(() => {
						// eslint-disable-next-line arrow-body-style
						}).catch(() => {
							if (comCooldown.has(message.author.id)) {
								comCooldown.delete(message.author.id);
							}
							return;
						});
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

					const loggingembed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor));

					if (!closeReason) {
						loggingembed
							.addField(`**${this.client.user.username} - Close**`,
								`**◎ Success:** <@${message.author.id}> has closed ticket \`#${message.channel.name}\``);
						logchan.send({ embeds: [loggingembed] });
						logchan.send({ files: [attachment] });
						if (comCooldown.has(message.author.id)) {
							comCooldown.delete(message.author.id);
						}
					} else {
						loggingembed
							.addField(`**${this.client.user.username} - Close**`,
								`**◎ Success:** <@${message.author.id}> has closed ticket \`#${message.channel.name}\`\nReason: \`${closeReason}\``);
						logchan.send({ embeds: [loggingembed] });
						logchan.send({ files: [attachment] });
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

					const limitE = new MessageEmbed()
						.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Close**`,
							`**◎ Success:** Ticket close cancelled.`);
					message.channel.send({ embeds: [limitE] }).then((ca) => this.client.utils.deletableCheck(ca, 10000));
					return;
				}
			});
		} else {
			this.client.utils.messageDelete(message, 10000);

			const badChannel = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Close**`,
					`**◎ Error:** Please only run \`${prefix}close\` once!`);
			message.channel.send({ embeds: [badChannel] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
	}

};
