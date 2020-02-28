const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
	config: {
		name: 'add',
		usage: '${prefix}add <@user>',
		category: 'ticket',
		description: 'Adds a user to the ticket',
		accessableby: 'Staff',
	},
	run: async (bot, message, args, color) => {
		const language = require('../../storage/messages.json');

		const suppRole = db
			.prepare(
				`SELECT role FROM ticketConfig WHERE guildid = ${message.guild.id}`
			)
			.get();
		const modRole =
			message.guild.roles.cache.find(x => x.name === 'Support Team') ||
			message.guild.roles.cache.find(r => r.id === suppRole.role);
		if (!modRole) {
			const nomodRole = new MessageEmbed()
				.setColor('36393F')
				.setDescription(`${language.tickets.nomodRole}`);
			message.channel.send(nomodRole);
			return;
		}

		if (
			!message.member.roles.cache.has(modRole.id) &&
			message.author.id !== message.guild.ownerID
		) {
			const donthaveroleMessage = language.tickets.donthaveRole;
			const role = donthaveroleMessage.replace('${role}', modRole);
			const donthaveRole = new MessageEmbed()
				.setColor('36393F')
				.setDescription(`${role}`);
			message.channel.send(donthaveRole);
			return;
		}

		const rUser = message.mentions.users.first();
		if (!rUser) {
			const nouser = new MessageEmbed()
				.setColor('36393F')
				.setDescription(`${language.tickets.cantfindUser}`);
			message.channel.send(nouser);
			return;
		}

		const channelArgs = message.channel.name.split('-');
		const foundTicket = db
			.prepare(
				`SELECT * FROM tickets WHERE guildid = ${
					message.guild.id
				} AND ticketid = (@ticketid)`
			)
			.get({
				ticketid: args[1] || channelArgs[channelArgs.length - 1],
			});
		if (foundTicket) {
			const getChan = message.guild.channels.cache.find(
				chan => chan.id === foundTicket.chanid
			);
			getChan
				.createOverwrite(rUser, {
					VIEW_CHANNEL: true,
					SEND_MESSAGES: true,
				})
				.catch(console.error);
			const addedMessage = language.tickets.added;
			const theuser = addedMessage.replace('${user}', rUser);
			getChan.send(`${theuser}`);
			const logget = db
				.prepare(
					`SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`
				)
				.get();
			if (!logget) return;
			const logchan = message.guild.channels.cache.find(
				chan => chan.id === logget.log
			);
			if (!logchan) return;
			const loggingembed = new MessageEmbed()
				.setColor(color)
				.setDescription(
					`<@${message.author.id}> added ${rUser} to ticket <#${getChan.id}>`
				);
			logchan.send(loggingembed);
		}
		else {
			const errEmbed = new MessageEmbed()
				.setColor('#36393F')
				.setDescription('This ticket could not be found.');
			message.channel.send(errEmbed);
		}
	},
};
