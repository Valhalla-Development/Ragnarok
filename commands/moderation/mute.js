/* eslint-disable no-unused-vars, no-shadow */
const { MessageEmbed } = require('discord.js');
const { ownerID } = require('../../storage/config.json');
const ms = require('ms');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
	config: {
		name: 'mute',
		usage: '${prefix}mute <@user> <time> <reason>',
		category: 'moderation',
		description: 'Mutes a user in the guild',
		accessableby: 'Staff',
	},
	run: async (bot, message, args) => {
		const prefixgrab = db
			.prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
			.get(message.guild.id);
		const prefix = prefixgrab.prefix;

		const language = require('../../storage/messages.json');

		message.delete();

		if (
			!message.member.hasPermission('KICK_MEMBERS') &&
			message.author.id !== ownerID
		) {
			message.channel
				.send(`${language.mute.noAuthorPermission}`)
				.then(message =>
					message.delete({
						timeout: 5000,
					})
				);
			return;
		}

		const mod = message.author;
		const user = message.guild.member(
			message.mentions.users.first() || message.guild.members.get(args[0])
		);
		const noUserMessage = language.mute.noUser;
		const noUserConvert = noUserMessage.replace('${prefix}', prefix);
		if (!user) {
			return message.reply(`${noUserConvert}`).then(message =>
				message.delete({
					timeout: 5000,
				})
			);
		}
		const reason = message.content
			.split(' ')
			.splice(3)
			.join(' ');
		if (!reason) {
			return message.channel.send(`${language.mute.noReason}`).then(message =>
				message.delete({
					timeout: 5000,
				})
			);
		}
		let muterole = message.guild.roles.find(x => x.name === 'Muted');
		if (!muterole) {
			try {
				muterole = await message.guild.createRole({
					name: 'Muted',
					color: '#000000',
					permissions: [],
				});
				message.guild.channels.forEach(async (channel, id) => {
					await channel.createOverwrite(muterole, {
						SEND_MESSAGES: false,
						ADD_REACTIONS: false,
					});
				});
			}
			catch (e) {
				console.log(e.stack);
			}
		}

		const mutetime = args[1];
		if (!mutetime) {
			return message.channel.send(`${language.mute.noTime}`).then(message =>
				message.delete({
					timeout: 5000,
				})
			);
		}

		const dbid = db
			.prepare(
				`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`
			)
			.get();
		if (!dbid) {
			await user.roles.add(muterole.id);
			const muteembed = new MessageEmbed()
				.setAuthor(
					' Action | Mute',
					'https://images-ext-2.discordapp.net/external/Wms63jAyNOxNHtfUpS1EpRAQer2UT0nOsFaWlnDdR3M/https/image.flaticon.com/icons/png/128/148/148757.png'
				)
				.addField('User', `<@${user.id}>`)
				.addField('Reason', `${reason}`)
				.addField('Time', `${mutetime}`)
				.addField('Moderator', `${mod}`)
				.setColor('#ff0000');
			message.channel.send(muteembed);

			setTimeout(function() {
				user.roles.remove(muterole.id);
				const unmuteembed = new MessageEmbed()
					.setAuthor(' Action | Un-Mute', 'http://odinrepo.tk/speaker.png')
					.addField('User', `<@${user.id}>`)
					.addField('Reason', 'Mute time ended')
					.setColor('#ff0000');

				message.channel.send(unmuteembed);
			}, ms(mutetime));
		}
		else {
			const dblogs = dbid.channel;
			await user.roles.add(muterole.id);
			const muteembed = new MessageEmbed()
				.setAuthor(
					' Action | Mute',
					'https://images-ext-2.discordapp.net/external/Wms63jAyNOxNHtfUpS1EpRAQer2UT0nOsFaWlnDdR3M/https/image.flaticon.com/icons/png/128/148/148757.png'
				)
				.addField('User', `<@${user.id}>`)
				.addField('Reason', `${reason}`)
				.addField('Time', `${mutetime}`)
				.addField('Moderator', `${mod}`)
				.setColor('#ff0000');
			bot.channels.get(dblogs).send(muteembed);
			message.channel.send(muteembed);

			setTimeout(function() {
				user.roles.remove(muterole.id);
				const unmuteembed = new MessageEmbed()
					.setAuthor(' Action | Un-Mute', 'http://odinrepo.tk/speaker.png')
					.addField('User', `<@${user.id}>`)
					.addField('Reason', 'Mute time ended')
					.setColor('#ff0000');

				bot.channels.get(dblogs).send(unmuteembed);
				message.channel.send(unmuteembed);
			}, ms(mutetime));
		}
	},
};
