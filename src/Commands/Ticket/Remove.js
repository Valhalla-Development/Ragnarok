const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Removes tagged user from a ticket.',
			category: 'Ticket',
			usage: '<@user> [ticketid]'
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
				.addField(`**${this.client.user.username} - Remove**`,
					`**◎ Error:** This server doesn't have a \`Support Team\` role made, so the ticket can't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`);
			message.channel.send(nomodRole).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		if (!message.member.roles.cache.has(modRole.id) && message.author.id !== message.guild.ownerID) {
			const donthaveRole = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Remove**`,
					`**◎ Error:** Sorry! You do not have the **${modRole}** role.`);
			message.channel.send(donthaveRole).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const rUser = message.mentions.users.first();
		if (!rUser) {
			const nouser = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Remove**`,
					`**◎ Error:** Sorry! I could not find the specified user!`);
			message.channel.send(nouser).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const channelArgs = message.channel.name.split('-');
		const foundTicket = db.prepare(`SELECT * FROM tickets WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`).get({
			ticketid: args[1] || channelArgs[channelArgs.length - 1]
		});
		if (foundTicket) {
			const getChan = message.guild.channels.cache.find((chan) => chan.id === foundTicket.chanid);
			getChan.createOverwrite(rUser, {
				VIEW_CHANNEL: false
			}).catch(console.error);
			const removed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Remove**`,
					`**◎ Success:** ${rUser} has been removed from the ticket!`);
			getChan.send(removed);
			const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
			const logchan = message.guild.channels.cache.find((chan) => chan.id === logget.log);
			if (!logchan) return;
			const loggingembed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setDescription(`<@${message.author.id}> removed ${rUser} from ticket <#${getChan.id}>`);
			logchan.send(loggingembed);
		} else {
			const errEmbed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Remove**`,
					`**◎ Error:** This ticket could not be found.`);
			message.channel.send(errEmbed).then((m) => m.delete({ timeout: 15000 }));
		}
	}

};
