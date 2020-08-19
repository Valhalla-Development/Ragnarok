const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'E',
			aliases: ['E'],
			description: 'E',
			category: 'E',
			usage: 'E'
		});
	}

	async run(message, args) {
		if (!message.member.hasPermission('BAN_MEMBERS') && !this.client.owners.includes(message.author.id)) {
			const errEmbed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField(`**${this.client.user.username} - Ban**`,
					`**◎ Error:** You do not have permission to run this command.`);
			message.channel.send(errEmbed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
		if (!id) {
			const user = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
			if (!user) {
				const noUser = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField(`**${this.client.user.username} - Ban**`,
						`**◎ Error:** You must specify a user to ban!`);
				message.channel.send(noUser).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			let reason = args.slice(1).join(' ');
			if (!reason) reason = 'No reason given';

			message.guild.members.ban(user, { reason: `${reason}` });

			const logsEmbed = new MessageEmbed()
				.setThumbnail(this.client.user.displayAvatarURL())
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('User Banned', [
					`**◎ Banned User::** ${user}, ID: ${user.id}`,
					`**◎ Reason:** ${reason}`,
					`**◎ Moderator:** ${message.author}, ID: ${message.author.id}`,
					`**◎ Time:** ${message.createdAt}`
				])
				.setFooter('User Ban Logs')
				.setTimestamp();
			message.channel.send(logsEmbed);
		} else {
			const logch = id.channel;
			const logsch = this.client.channels.cache.get(logch);

			const chuser = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
			if (!chuser) {
				const userEmbed = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField(`**${this.client.user.username} - Ban**`,
						`**◎ Error:** You must specify a user to ban!`);
				message.channel.send(userEmbed).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			let chreason = args.slice(1).join(' ');
			if (!chreason) {
				chreason = 'None given';
			}

			message.guild.members.ban(chuser, { reason: `${chreason}` });
			message.channel.send(`${chuser}, was banned by ${message.author}\nCheck ${logsch} for more information!`).then(m => m.delete({ timeout: 15000 }));

			const logsEmbedD = new MessageEmbed()
				.setThumbnail(this.client.user.displayAvatarURL())
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('User Banned', [
					`**◎ Banned User::** ${chuser}, ID: ${chuser.id}`,
					`**◎ Reason:** ${chreason}`,
					`**◎ Moderator:** ${message.author}, ID: ${message.author.id}`,
					`**◎ Time:** ${message.createdAt}`
				])
				.setFooter('User Ban Logs')
				.setTimestamp();
			logsch.send(logsEmbedD);
		}
	}

};
