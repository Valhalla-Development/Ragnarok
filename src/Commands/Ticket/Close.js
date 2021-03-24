const Command = require('../../Structures/Command');
const { MessageAttachment, MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const fetchAll = require('discord-fetch-all');

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
		const reason = args.slice(0).join(' ');

		// Make sure it's inside the ticket channel.
		if (foundTicket && message.channel.id !== foundTicket.chanid) {
			this.client.utils.messageDelete(message, 10000);

			const badChannel = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Close**`,
					`**◎ Error:** You can't use the close command outside of a ticket channel.`);
			message.channel.send(badChannel).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
		if (!foundTicket) {
			this.client.utils.messageDelete(message, 10000);

			const errEmbed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Close**`,
					`**◎ Error:** You can't use the close command outside of a ticket channel.`);
			message.channel.send(errEmbed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// Ask for confirmation within 10 seconds.
		const user = this.client.users.cache.find((a) => a.id === foundTicket.authorid);
		const confirmEmbed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Close**`,
				`**◎ Confirmation:** Are you sure? Once confirmed, you cannot reverse this action!\nTo confirm, type \`${prefix}confirm\`. This will time out in 20 seconds and be cancelled.`);
		message.channel.send(confirmEmbed).then((msg) => {
			message.channel.awaitMessages((response) => response.content === `${prefix}confirm`, {
				max: 1,
				time: 20000,
				errors: ['time']
			}).then(async () => {
				message.channel.startTyping();
				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ticket**`,
						`Please stand-by while I gather all messages. This may take a while dependant on how many messages are in this channel.`);
				message.channel.send(embed);

				const allMessages = await fetchAll.messages(message.channel, {
					reverseArray: true,
					userOnly: false,
					botOnly: false,
					pinnedOnly: false
				});

				allMessages.filter((m) => m.content !== '');
				const mapfile = allMessages.map(e => ({ time: new Date(e.createdTimestamp).toUTCString(), username: e.author.username, message: e.content }));
				const file = mapfile.filter((m) => m.message !== '');
				file.unshift({ tickeData: `Ticket Creator: ${user.username} || Ticket Reason: ${foundTicket.reason}` });

				const buffer = Buffer.from(JSON.stringify(file, null, 3));
				const attachment = new MessageAttachment(buffer, `${user.username}-ticket.json`);

				try {
					user.send(attachment);
				} catch {
					return;
				}

				message.channel.stopTyping();

				message.channel.delete();

				const deleteTicket = db.prepare(`DELETE FROM tickets WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`);
				deleteTicket.run({
					ticketid: channelArgs[channelArgs.length - 1]
				});

				const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
				if (!logget) {
					return;
				}

				const logchan = message.guild.channels.cache.find((chan) => chan.id === logget.log);
				if (!logchan) return;

				const loggingembed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor));

				if (!reason) {
					loggingembed
						.addField(`**${this.client.user.username} - Close**`,
							`**◎ Success:** <@${message.author.id}> has closed ticket \`#${message.channel.name}\``);
					logchan.send(loggingembed);
					logchan.send(attachment);
				} else {
					loggingembed
						.addField(`**${this.client.user.username} - Close**`,
							`**◎ Success:** <@${message.author.id}> has closed ticket \`#${message.channel.name}\`\nReason: \`${reason}\``);
					logchan.send(loggingembed);
					logchan.send(attachment);

					user.send(`Your ticket in guild: \`${message.guild.name}\` was closed for the following reason:\n\`${reason}\``).then(() => {
					// eslint-disable-next-line arrow-body-style
					}).catch(() => {
						return;
					});
				}
			}).catch(() => {
				this.client.utils.deletableCheck(msg, 0);
			});
		});
	}

};
