const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const fetch = require('node-fetch-cjs');

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
			this.client.utils.messageDelete(message, 10000);

			const incorrectFormat = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - A4K**`,
					`**◎ Error:** Incorrect usage! Please use \`${prefix}a4k <search>\``);
			message.channel.send({ embeds: [incorrectFormat] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const searchTerm = args.join('%20');

		fetch.default(`https://www.reddit.com/r/Addons4Kodi/search.json?q=${searchTerm}&restrict_sr=1&limit=3`)
			.then(res => res.json())
			.then(res => res.data.children)
			.then(res => {
				const embed = new MessageEmbed()
					.setAuthor({ name: `${res[0].data.subreddit} - Top 3 results for: ${args.join(' ')}`, iconURL: 'http://i.imgur.com/sdO8tAw.png' })
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setDescription(`[**◎ ${res[0].data.title}**](${res[0].data.url})\n \`\`\`${res[0].data.selftext.substring(0, 150)}...\`\`\`\n
					[**◎ ${res[1].data.title}**](${res[1].data.url})\n  \`\`\`${res[1].data.selftext.substring(0, 150)}...\`\`\`\n
					[**◎ ${res[2].data.title}**](${res[2].data.url})\n  \`\`\`${res[2].data.selftext.substring(0, 150)}...\`\`\`\n
					[**__Search Results...__**](https://www.reddit.com/r/Addons4Kodi/search/?q=${searchTerm}&restrict_sr=1)`);
				message.channel.send({ embeds: [embed] });
			}).catch(() => {
				this.client.utils.messageDelete(message, 10000);
				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - A4K**`,
						`**◎ Error:** No results found!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			});
	}

};
