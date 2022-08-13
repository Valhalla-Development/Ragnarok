const Command = require('../../Structures/Command');
const { EmbedBuilder } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['rich'],
			description: 'Displays the leaderboard for the economy system.',
			category: 'Economy',
			usage: '[@user]'
		});
	}

	async run(message) {
		const top10 = db.prepare('SELECT * FROM balance WHERE guild = ? ORDER BY total DESC;').all(message.guild.id);
		if (!top10) {
			return;
		}

		let userNames = '';
		let total = '';
		let j = 0;

		for (let i = 0; i < top10.length; i++) {
			const data = top10[i];
			const fetchUsers = message.guild.members.members.cache.get(data.user);

			if (fetchUsers === undefined) {
				continue;
			}

			j++;

			userNames += `◎ \`${j}\` ${fetchUsers}\n`;
			total += `<:coin:706659001164628008> \`${data.total.toLocaleString('en')}\`\n`;
			if (j === 10) break;
		}

		const embed = new EmbedBuilder()
			.setAuthor({ name: `Leaderboard for ${message.guild.name}`, iconURL: message.guild.iconURL({ dynamic: true }) })
			.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
			.addFields({ name: 'Top 10',
				value: userNames, inline: true },
			{ name: 'Total',
				value: total, inline: true });
		message.channel.send({ embeds: [embed] });
		return;
	}

};

