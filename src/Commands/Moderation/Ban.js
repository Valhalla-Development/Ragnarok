const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['begone'],
			description: 'Bans tagged user from the guild.',
			category: 'Moderation',
			usage: '<@user>',
			requiredPermission: 'BAN_MEMBERS'
		});
	}

	async run(message, args) {
		const id = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
		if (!id) {
			const user = message.guild.member(message.mentions.users.first() || message.guild.members.cache.get(args[0]));
			if (!user) {
				const noUser = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ban**`,
						`**◎ Error:** You must specify a user to ban!`);
				message.channel.send(noUser).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			let reason = args.slice(1).join(' ');
			if (!reason) reason = 'No reason given';

			message.guild.members.ban(user, { reason: `${reason}` });

			const logsEmbed = new MessageEmbed()
				.setThumbnail(this.client.user.displayAvatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
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
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Ban**`,
						`**◎ Error:** You must specify a user to ban!`);
				message.channel.send(userEmbed).then((m) => this.client.utils.deletableCheck(m, 10000));
				return;
			}

			let chreason = args.slice(1).join(' ');
			if (!chreason) {
				chreason = 'None given';
			}

			message.guild.members.ban(chuser, { reason: `${chreason}` });
			const embed = new MessageEmbed()
				.setThumbnail(this.client.user.displayAvatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField('User Banned', [
					`**◎ Banned User::** ${chuser}, ID: ${chuser.id}`,
					`**◎ Reason:** ${chreason}`,
					`**◎ Moderator:** ${message.author}, ID: ${message.author.id}`,
					`**◎ Time:** ${message.createdAt}`
				])
				.setTimestamp();
			message.channel.send(embed);

			const logsEmbedD = new MessageEmbed()
				.setThumbnail(this.client.user.displayAvatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
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
