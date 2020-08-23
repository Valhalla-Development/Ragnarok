const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Fetches search results from r/Addons4Kodi.',
			category: 'Hidden',
			usage: '<input>'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		if (!args[0]) {
			const incorrectFormat = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || 'A10000')
				.addField(`**${this.client.user.username} - A4K**`,
					`**◎ Error:** Incorrect usage! Please use \`${prefix}a4k <search>\``);
			message.channel.send(incorrectFormat).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const searchTerm = args.join('%20');

		fetch(`https://www.reddit.com/r/Addons4Kodi/search.json?q=${searchTerm}&restrict_sr=1&limit=3`)
			.then(res => res.json())
			.then(res => res.data.children)
			.then(res => {
				const embed = new MessageEmbed()
					.setAuthor(`${res[0].data.subreddit} - Top 3 results for: ${args.join(' ')}`, 'http://i.imgur.com/sdO8tAw.png')
					.setColor(message.guild.me.displayHexColor || 'A10000')
					.setDescription(`[**◎ ${res[0].data.title}**](${res[0].data.url})\n \`\`\`${res[0].data.selftext.substring(0, 250)}...\`\`\`\n
					[**◎ ${res[1].data.title}**](${res[1].data.url})\n  \`\`\`${res[1].data.selftext.substring(0, 250)}...\`\`\`\n
					[**◎ ${res[2].data.title}**](${res[2].data.url})\n  \`\`\`${res[2].data.selftext.substring(0, 250)}...\`\`\`\n
					[**__Search Results...__**](https://www.reddit.com/r/Addons4Kodi/search/?q=${searchTerm}&restrict_sr=1)`);
				message.channel.send(embed);
			}).catch(() => message.channel.send('No results found.'));
	}

};
