/* eslint-disable no-shadow */
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const { ownerID } = require('../../storage/config.json');

module.exports = {
	config: {
		name: 'ban',
		usage: '${prefix}ban',
		category: 'informative',
		description: 'Bans a user from the guild',
		accessableby: 'Staff',
	},
	run: async (bot, message, args, color) => {
		const language = require('../../storage/messages.json');

		message.delete();

		if (
			!message.member.hasPermission('BAN_MEMBERS') &&
			message.author.id !== ownerID
		) {
			message.channel.send(`${language.ban.noAuthorPermission}`).then(msg => {
				msg.delete({
					timeout: 10000,
				});
			});
			return;
		}

		const id = db
			.prepare(
				`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`
			)
			.get();
		if (!id) {
			const user = message.guild.member(
				message.mentions.users.first() || message.guild.members.get(args[0])
			);
			if (!user) {
				return message.reply(`${language.ban.notarget}`).then(msg =>
					msg.delete({
						timeout: 5000,
					})
				);
			}

			let reason = args.slice(1).join(' ');
			if (!reason) reason = 'No reason given';

			message.guild.member(user).ban(reason);

			const logsEmbed = new MessageEmbed()
				.setTitle('User Banned')
				.setFooter('User Ban Logs')
				.setColor(color)
				.setTimestamp()
				.addField('Banned User:', `${user}, ID: ${user.id}`)
				.addField('Reason:', reason)
				.addField('Moderator:', `${message.author}, ID: ${message.author.id}`)
				.addField('Time:', message.createdAt);

			message.channel.send(logsEmbed);
		}
		else {
			const logch = id.channel;

			const logsch = bot.channels.get(logch);

			const chuser = message.guild.member(
				message.mentions.users.first() || message.guild.members.get(args[0])
			);
			if (!chuser) {
				return message.reply(`${language.ban.notarget}`).then(message =>
					message.delete({
						timeout: 5000,
					})
				);
			}

			let chreason = args.slice(1).join(' ');
			if (!chreason) {
				chreason = 'no';
			}

			message.guild.member(chuser).ban(chreason);
			message.channel
				.send(
					`${chuser}, was banned by ${
						message.author
					}\nCheck <#${logsch}> for more information!`
				)
				.then(
					message.delete({
						timeout: 5000,
					})
				);

			const logsEmbedD = new MessageEmbed()
				.setTitle('User Banned')
				.setFooter('User Ban Logs')
				.setColor('#ff0000')
				.setTimestamp()
				.addField('Banned User:', `${chuser}, ID: ${chuser.id}`)
				.addField('Reason:', chreason)
				.addField('Moderator:', `${message.author}, ID: ${message.author.id}`)
				.addField('Time:', message.createdAt);

			bot.channels.get(logsch).send(logsEmbedD);
		}
	},
};
