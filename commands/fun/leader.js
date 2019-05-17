const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
	config: {
		name: 'leader',
		aliases: ['pleader'],
		usage: '${prefix}leader',
		category: 'fun',
		description: 'Displays level leaderboard',
		accessableby: 'Everyone',
	},
	run: async (bot, message) => {
		const top10 = db
			.prepare(
				'SELECT * FROM scores WHERE guild = ? ORDER BY points DESC LIMIT 10;'
			)
			.all(message.guild.id);
		bot.getScore = db.prepare(
			'SELECT * FROM scores WHERE user = ? AND guild = ?'
		);
		bot.setScore = db.prepare(
			'INSERT OR REPLACE INTO scores (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);'
		);

		const embed = new MessageEmbed()
			.setTitle('Leaderboard')
			.setAuthor(bot.user.username, bot.user.avatarURL())
			.setDescription('Top 10 Points!')
			.setColor(0x00ae86);

		for (const data of top10) {
			embed.addField(
				bot.users.get(data.user).tag,
				`${data.points} points (level ${data.level})`
			);
		}
		return message.channel.send({
			embed,
		});
	},
};
