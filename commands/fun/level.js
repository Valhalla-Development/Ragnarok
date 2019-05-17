const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
	config: {
		name: 'level',
		usage: '${prefix}level',
		category: 'fun',
		description: 'Displays current level',
		accessableby: 'Everyone',
	},
	run: async (bot, message, args, color) => {
		const language = require('../../storage/messages.json');

		bot.getScore = db.prepare(
			'SELECT * FROM scores WHERE user = ? AND guild = ?'
		);
		bot.setScore = db.prepare(
			'INSERT OR REPLACE INTO scores (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);'
		);

		let score;
		if (message.guild) {
			score = bot.getScore.get(message.author.id, message.guild.id);
		}

		if (!args[0]) {
			const nxtLvlXp = score.level * 5000;
			const difference = nxtLvlXp - score.points;
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.username}'s Level`)
				.setColor(color)
				.setThumbnail(message.author.displayAvatarURL())
				.addField('XP', score.points, true)
				.addField('Level', score.level, true)
				.setFooter(
					`${difference} XP required to level up!`,
					message.author.displayAvatarURL()
				);

			message.channel.send(embed);
		}
		else {
			const user = message.mentions.users.first();
			if (!user) {
				const noUserEmbed = new MessageEmbed()
					.setColor('36393F')
					.setDescription(`${language.points.noUser}`);
				message.channel.send(noUserEmbed);
				return;
			}
			let otherbalance;
			if (message.guild) {
				otherbalance = bot.getScore.get(user.id, message.guild.id);
			}
			if (user.bot) {
				return;
			}
			const nxtLvlXp = otherbalance.level * 5000;
			const difference = nxtLvlXp - otherbalance.points;
			const otherembed = new MessageEmbed()
				.setAuthor(`${user.username}'s Level`)
				.setColor(color)
				.setThumbnail(user.displayAvatarURL())
				.addField('XP', otherbalance.points, true)
				.addField('Level', otherbalance.level, true)
				.setFooter(
					`${difference} XP required to level up!`,
					message.author.displayAvatarURL()
				);

			message.channel.send(otherembed);
		}
	},
};
