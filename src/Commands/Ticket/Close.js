const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Closes the ticket.',
			category: 'Ticket'
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
			const badChannel = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Wrong Channel**',
					`**◎ Error:** You can't use the close command outside of a ticket channel.`);
			message.channel.send(badChannel).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		if (!foundTicket) {
			const errEmbed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Wrong Channel**',
					`**◎ Error:** You can't use the close command outside of a ticket channel.`);
			message.channel.send(errEmbed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		// Ask for confirmation within 10 seconds.
		const user = this.client.users.cache.find((a) => a.id === foundTicket.authorid);
		const confirmEmbed = new MessageEmbed()
			.setColor(message.guild.me.displayHexColor || '36393F')
			.addField('**Confirmation**',
				`**◎ Confirmation:** Are you sure? Once confirmed, you cannot reverse this action!\nTo confirm, type \`${prefix}confirm\`. This will time out in 20 seconds and be cancelled.`);
		message.channel.send(confirmEmbed).then((msg) => {
			message.channel.awaitMessages((response) => response.content === `${prefix}confirm`, {
				max: 1,
				time: 20000,
				errors: ['time']
			}).then(() => {
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
					.setColor(message.guild.me.displayHexColor || '36393F');

				if (!reason) {
					loggingembed
						.addField('**Success**',
							`**◎ Success:** <@${message.author.id}> has closed ticket \`#${message.channel.name}\``);
					logchan.send(loggingembed);
				} else {
					loggingembed
						.addField('**Success**',
							`**◎ Success:** <@${message.author.id}> has closed ticket \`#${message.channel.name}\`\nReason: \`${reason}\``);
					logchan.send(loggingembed);

					user.send(`Your ticket in guild: \`${message.guild.name}\` was closed for the following reason:\n\`${reason}\``).then(() => {
					// eslint-disable-next-line arrow-body-style
					}).catch(() => {
						return;
					});
				}
			}).catch(() => {
				msg.delete();
			});
		});
	}

};
