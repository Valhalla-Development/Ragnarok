const Command = require('../../Structures/Command');
const { MessageEmbed, Permissions } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Adds tagged user to the ticket.',
			category: 'Ticket',
			usage: '<@user> [ticketid]',
			botPerms: ['MANAGE_CHANNELS']
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
				.addField(`**${this.client.user.username} - Add**`,
					`**◎ Error:** This server doesn't have a \`Support Team\` role made, so the ticket can't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`);
			message.channel.send(nomodRole).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!message.member.roles.cache.has(modRole.id) && message.author.id !== message.guild.ownerID) {
			this.client.utils.messageDelete(message, 10000);

			const donthaveRole = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Add**`,
					`**◎ Error:** Sorry! You do not have the **${modRole}** role.`);
			message.channel.send(donthaveRole).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const rUser = message.mentions.users.first();
		if (!rUser) {
			this.client.utils.messageDelete(message, 10000);

			const nouser = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Add**`,
					`**◎ Error:** Sorry! I could not find the specified user!`);
			message.channel.send(nouser).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const channelArgs = message.channel.name.split('-');
		const foundTicket = db.prepare(`SELECT * FROM tickets WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`).get({
			ticketid: args[1] || channelArgs[channelArgs.length - 1]
		});
		if (foundTicket) {
			const getChan = message.guild.channels.cache.find((chan) => chan.id === foundTicket.chanid);
			const user = message.guild.members.cache.get(rUser.id);

			if (user.permissionsIn(getChan).has([Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.VIEW_CHANNEL])) {
				this.client.utils.messageDelete(message, 10000);

				const nouser = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Add**`,
						`**◎ Error:** This user has already been added to the channel!`);
				message.channel.send(nouser).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			getChan
				.createOverwrite(rUser, {
					VIEW_CHANNEL: true,
					SEND_MESSAGES: true
				}).catch(console.error);
			const nouser = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Add**`,
					`**◎ Success:** ${rUser} has been added to the ticket!`);
			getChan.send(nouser);

			const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
			if (!logget) return;
			const logchan = message.guild.channels.cache.find((chan) => chan.id === logget.log);
			if (!logchan) return;
			const loggingembed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Add**`,
					`**◎ Success:** <@${message.author.id}> added ${rUser} to ticket <#${getChan.id}>`);
			logchan.send(loggingembed);
		} else {
			const errEmbed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Add**`,
					`**◎ Error:** This ticket could not be found.`);
			message.channel.send(errEmbed).then((m) => this.client.utils.deletableCheck(m, 10000));
		}
	}

};
