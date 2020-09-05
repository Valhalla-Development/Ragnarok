const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Renames the ticket channel name.',
			category: 'Ticket'
		});
	}

	async run(message, args) {
		const suppRole = db.prepare(`SELECT role FROM ticketConfig WHERE guildid = ${message.guild.id}`).get();

		let modRole;
		if (suppRole) {
			modRole = message.guild.roles.cache.find((r) => r.id === suppRole.role);
		} else {
			modRole = message.guild.roles.cache.find((x) => x.name === 'Support Team');
		}

		if (!modRole) {
			const nomodRole = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Rename**`,
					`**◎ Error:** This server doesn't have a \`Support Team\` role made, so the ticket can't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`);
			message.channel.send(nomodRole).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (
			!message.member.roles.cache.has(modRole.id) && message.author.id !== message.guild.ownerID) {
			const donthaveRole = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Rename**`,
					`**◎ Error:** Sorry! You do not have the **${modRole}** role.`);
			message.channel.send(donthaveRole).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		let foundTicket = db.prepare(`SELECT * FROM tickets WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`).get({
			ticketid: args[0]
		});
		if (foundTicket) {
			const getChan = message.guild.channels.cache.find(
				(chan) => chan.id === foundTicket.chanid
			);
			const argResult = args.splice(1).join('-');
			getChan.setName(`ticket-${argResult}-${foundTicket.ticketid}`);
			const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
			const logchan = message.guild.channels.cache.find(
				(chan) => chan.id === logget.log
			);
			if (!logchan) return;
			const loggingembed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Rename**`,
					`**◎ Success:** <@${message.author.id}> renamed ticket from \`#${getChan.name}\` to <#${getChan.id}>`);
			logchan.send(loggingembed);
		} else if (!foundTicket && message.channel.name.startsWith('ticket')) {
			const channelArgs = message.channel.name.split('-');
			foundTicket = db.prepare(`SELECT * from tickets WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`).get({
				ticketid: channelArgs[channelArgs.length - 1]
			});
			const argResult = args.join('-');
			message.channel.setName(`ticket-${argResult}-${foundTicket.ticketid}`);
			const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
			const logchan = message.guild.channels.cache.find(
				(chan) => chan.id === logget.log
			);
			if (!logchan) return;
			const loggingembed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Rename**`,
					`**◎ Success:** <@${message.author.id}> renamed ticket from \`#${message.channel.name}\` to <#${message.channel.id}>`);
			logchan.send(loggingembed);
		} else if (!foundTicket && !message.channel.name.startsWith('ticket-')) {
			const errEmbed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Rename**`,
					`**◎ Error:** This ticket could not be found.`);
			message.channel.send(errEmbed).then((m) => this.client.utils.deletableCheck(m, 10000));
		}
	}

};
