const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['fclose'],
			description: 'Forcefully closes a ticket.',
			category: 'Ticket',
			usage: '[ticketid]'
		});
	}

	async run(message, args) {
		const suppRole = db.prepare(`SELECT role FROM ticketConfig WHERE guildid = ${message.guild.id}`).get();

		let modRole;
		if (suppRole) {
			modRole = message.guild.roles.cache.find((supId) => supId.id === suppRole.role);
		} else {
			modRole = message.guild.roles.cache.find((supNa) => supNa.name === 'Support Team');
		}

		if (!modRole) {
			this.client.utils.messageDelete(message, 10000);

			const nomodRole = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - ForceClose**`,
					`**◎ Error:** This server doesn't have a \`Support Team\` role made, so the ticket can't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`);
			message.channel.send(nomodRole).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!message.member.roles.cache.has(modRole.id) && message.author.id !== message.guild.ownerID) {
			this.client.utils.messageDelete(message, 10000);

			const donthaveRole = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - ForceClose**`,
					`**◎ Error:** Sorry! You do not have the **${modRole}** role.`);
			message.channel.send(donthaveRole).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const channelArgs = message.channel.name.split('-');
		const foundTicket = db.prepare(`SELECT * FROM tickets WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`).get({
			ticketid: args[0] || channelArgs[channelArgs.length - 1]
		});
		if (foundTicket) {
			const getChan = message.guild.channels.cache.find((chan) => chan.id === foundTicket.chanid);
			const forceclosetimer = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setTitle(':x: Closing Ticket! :x:')
				.setDescription(`This ticket will automatically close in 10 seconds.**\nType a message to cancel the timer.`);
			getChan.send(forceclosetimer).then((timerMsg) => {
				getChan.awaitMessages((resp) => resp.author.id === message.author.id || foundTicket.authorid, {
					max: 1,
					time: 10000,
					errors: ['time']
				}).then(() => {
					this.client.utils.messageDelete(message, 10000);

					const cancelTimer = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.setDescription('Canceling Ticket Close');
					timerMsg.edit(cancelTimer).then((m) => this.client.utils.deletableCheck(m, 10000));
				}).catch(() => {
					getChan.delete();
					db.prepare(`DELETE FROM tickets WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`).run({
						ticketid: foundTicket.ticketid
					});
					const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
					if (!logget) return;
					const logchan = message.guild.channels.cache.find((chan) => chan.id === logget.log);
					if (!logchan) return;
					const loggingembed = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - ForceClose**`,
							`**◎ Success:** <@${message.author.id}> has forcefully closed ticket \`#${message.channel.name}\``);
					logchan.send(loggingembed);
				});
			});
		} else {
			const errEmbed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - ForceClose**`,
					`**◎ Error:** I could not find the ticket!`);
			message.channel.send(errEmbed);
		}
	}

};
