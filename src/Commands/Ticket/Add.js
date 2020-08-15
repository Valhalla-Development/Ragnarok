const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Adds tagged user to the ticket.',
			category: 'Ticket',
			usage: '<@user> [ticketid]'
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
			const nomodRole = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**No Mod Role**',
					`**◎ Error:** This server doesn't have a \`Support Team\` role made, so the ticket can't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`);
			message.channel.send(nomodRole).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		if (!message.member.roles.cache.has(modRole.id) && message.author.id !== message.guild.ownerID) {
			const donthaveRole = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Invalid Perms**',
					`**◎ Error:** Sorry! You do not have the **${modRole}** role.`);
			message.channel.send(donthaveRole).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const rUser = message.mentions.users.first();
		if (!rUser) {
			const nouser = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Invalid Perms**',
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
			getChan
				.createOverwrite(rUser, {
					VIEW_CHANNEL: true,
					SEND_MESSAGES: true
				}).catch(console.error);
			const nouser = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Success**',
					`**◎ Success:** ${rUser} has been added to the ticket!`);
			getChan.send(nouser);

			const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
			if (!logget) return;
			const logchan = message.guild.channels.cache.find((chan) => chan.id === logget.log);
			if (!logchan) return;
			const loggingembed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Success**',
					`**◎ Success:** <@${message.author.id}> added ${rUser} to ticket <#${getChan.id}>`);
			logchan.send(loggingembed);
		} else {
			const errEmbed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**No Ticket**',
					`**◎ Error:** This ticket could not be found.`);
			message.channel.send(errEmbed).then((m) => m.delete({ timeout: 15000 }));
		}
	}

};
