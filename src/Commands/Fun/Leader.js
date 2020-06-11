const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['leaderboard'],
			description: 'Displays the leaderboard for the level system.',
			category: 'Fun',
			usage: 'Level (@tag)'
		});
	}

	async run(message) {
		const top10 = db.prepare('SELECT * FROM scores WHERE guild = ? ORDER BY points DESC LIMIT 10;').all(message.guild.id);
		if (!top10) {
			return;
		}

		let userNames = '';
		let levels = '';
		let xp = '';
		for (let i = 0; i < top10.length; i++) {
			const data = top10[i];
			let user = this.client.users.cache.get(data.user);
			if (user === undefined) {
				user = 'User Left Guild.';
			}

			userNames += `\`${i + 1}\` ${user}\n`;
			levels += `\`${data.level}\`\n`;
			xp += `\`${data.points.toLocaleString('en')}\`\n`;
		}

		const embed = new MessageEmbed()
			.setAuthor(`Leaderboard for ${message.guild.name}`, message.guild.iconURL({ dynamic: true }))
			.setColor('36393F')
			.addFields({ name: 'Top 10', value: userNames, inline: true },
				{ name: 'Level', value: levels, inline: true },
				{ name: 'XP', value: xp, inline: true });
		message.channel.send(embed);
		return;
	}

};

