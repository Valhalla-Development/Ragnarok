/* eslint-disable no-shadow, no-unused-vars */
const { MessageEmbed } = require('discord.js');
const { ownerID } = require('../../storage/config.json');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
	config: {
		name: 'poll',
		usage: '${prefix}poll <question>',
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

		if (
			!message.member.hasPermission('MANAGE_GUILD') &&
			message.author.id !== ownerID
		) {
			message.channel.send(`${language.poll.noPermission}`);
			return;
		}

		// Check for input
		if (!args[0]) {
			const incorrectUsageMessage = language.poll.incorrectUsage;
			const incorrectUsage = incorrectUsageMessage.replace('${prefix}', prefix);

			message.channel.send(`${incorrectUsage}`);
			return;
		}

		// Create Embed
		const embed = new MessageEmbed()
			.setColor('#ffffff')
			.setFooter('React to Vote.')
			.setDescription(args.join(' '))
			.setTitle(`Poll Created By ${message.author.username}`);

		const msg = await message.channel
			.send(embed)
			.then(function(msg) {
				msg.react('✅');
				msg.react('❌');
				message.delete({
					timeout: 1000,
				});
			})
			.catch(function(error) {
				console.log(error);
			});
	},
};
