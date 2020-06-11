const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const language = require('../../../Storage/messages.json');
const fetch = require('node-fetch');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays search results from r/Addons4Kodi',
			category: 'Hidden',
			usage: 'A4k (@input)'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const incorrectUsageMessage = language.a4k.incorrectUsage;
		const incorrectUsage = incorrectUsageMessage.replace('${prefix}', prefix);

		if (!args[0]) {
			message.channel.send(incorrectUsage);
			return;
		}
		message.channel.send(this.category);

		const searchTerm = args.join('%20');

		fetch(`https://www.reddit.com/r/Addons4Kodi/search.json?q=${searchTerm}&restrict_sr=1&limit=3`)
			.then(res => res.json())
			.then(res => res.data.children)
			.then(res => {
				const embed = new MessageEmbed()
					.setAuthor(`${res[0].data.subreddit} - Top 3 results for: ${args.join(' ')}`, 'http://i.imgur.com/sdO8tAw.png')
					.setColor('36393F')
					.setDescription(`[**${res[0].data.title}**](${res[0].data.url})\n \`\`\`${res[0].data.selftext.substring(0, 250)}...\`\`\`\n
					[**${res[1].data.title}**](${res[1].data.url})\n  \`\`\`${res[1].data.selftext.substring(0, 250)}...\`\`\`\n
					[**${res[2].data.title}**](${res[2].data.url})\n  \`\`\`${res[2].data.selftext.substring(0, 250)}...\`\`\`\n
					[**__Search Results...__**](https://www.reddit.com/r/Addons4Kodi/search/?q=${searchTerm}&restrict_sr=1)`);
				message.channel.send(embed);
			}).catch(() => message.channel.send('No results found.'));
	}

};
