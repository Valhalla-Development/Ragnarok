const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const comCooldown = new Set();
const comCooldownSeconds = 600;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Renames the ticket channel name.',
			category: 'Ticket',
			botPerms: ['MANAGE_CHANNELS']
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
			this.client.utils.messageDelete(message, 10000);

			const nomodRole = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Rename**`,
					`**◎ Error:** This server doesn't have a \`Support Team\` role made, so the ticket can't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`);
			message.channel.send(nomodRole).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!message.member.roles.cache.has(modRole.id) && message.author.id !== message.guild.ownerID) {
			this.client.utils.messageDelete(message, 10000);

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
			if (comCooldown.has(`${message.author.id}-${getChan.id}`)) {
				this.client.utils.messageDelete(message, 10000);

				const donthaveRole = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Rename**`,
						`**◎ Error:** Sorry! You must wait at least 10 minutes before changing the channel name again due to an API restriction.`);
				message.channel.send(donthaveRole).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}
			if (!comCooldown.has(`${message.author.id}-${getChan.id}`)) {
				const argResult = args.splice(1).join('-');
				if (!argResult) {
					this.client.utils.messageDelete(message, 10000);

					const donthaveRole = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Rename**`,
							`**◎ Error:** Sorry! Please input a valid string.`);
					message.channel.send(donthaveRole).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
				if (argResult.length > 40 || argResult.length < 4) {
					this.client.utils.messageDelete(message, 10000);

					const donthaveRole = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Rename**`,
							`**◎ Error:** Sorry! Please keep the name length **below** 40 and **above** 4.`);
					message.channel.send(donthaveRole).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}
				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Rename**`,
						`**◎ Success:** <@${message.author.id}> renamed ticket to \`${argResult}\``);
				getChan.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));

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
				comCooldown.add(`${message.author.id}-${getChan.id}`);
				setTimeout(() => {
					if (comCooldown.has(`${message.author.id}-${getChan.id}`)) {
						comCooldown.delete(`${message.author.id}-${getChan.id}`);
					}
				}, comCooldownSeconds * 1000);
			}
		} else if (!foundTicket && message.channel.name.startsWith('ticket')) {
			const channelArgs = message.channel.name.split('-');
			foundTicket = db.prepare(`SELECT * from tickets WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`).get({
				ticketid: channelArgs[channelArgs.length - 1]
			});

			if (comCooldown.has(`${message.author.id}-${foundTicket.chanid}`)) {
				this.client.utils.messageDelete(message, 10000);

				const donthaveRole = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Rename**`,
						`**◎ Error:** Sorry! You must wait at least 10 minutes before changing the channel name again due to an API restriction.`);
				message.channel.send(donthaveRole).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			if (!comCooldown.has(`${message.author.id}-${foundTicket.chanid}`)) {
				const argResult = args.join('-');
				if (!argResult) {
					this.client.utils.messageDelete(message, 10000);

					const donthaveRole = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Rename**`,
							`**◎ Error:** Sorry! Please input a valid string.`);
					message.channel.send(donthaveRole).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				if (argResult.length > 40 || argResult.length < 4) {
					this.client.utils.messageDelete(message, 10000);

					const donthaveRole = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Rename**`,
							`**◎ Error:** Sorry! Please keep the name length **below** 40 and **above** 4.`);
					message.channel.send(donthaveRole).then((m) => this.client.utils.deletableCheck(m, 10000));
					return;
				}

				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Rename**`,
						`**◎ Success:** <@${message.author.id}> renamed ticket from to \`${argResult}`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));

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
				comCooldown.add(`${message.author.id}-${foundTicket.chanid}`);
				setTimeout(() => {
					if (comCooldown.has(`${message.author.id}-${foundTicket.chanid}`)) {
						comCooldown.delete(`${message.author.id}-${foundTicket.chanid}`);
					}
				}, comCooldownSeconds * 1000);
			}
		} else if (!foundTicket && !message.channel.name.startsWith('ticket-')) {
			this.client.utils.messageDelete(message, 10000);

			const errEmbed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Rename**`,
					`**◎ Error:** This ticket could not be found.`);
			message.channel.send(errEmbed).then((m) => this.client.utils.deletableCheck(m, 10000));
		}
	}

};
