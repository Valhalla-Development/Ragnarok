const Command = require('../../Structures/Command');
const { EmbedBuilder } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const fetch = require('node-fetch-cjs');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Fetches search results from r/AirReps',
			category: 'Fun',
			usage: '<input>'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		if (!args[0]) {
			this.client.utils.messageDelete(message, 10000);

			const incorrectFormat = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addField(`**${this.client.user.username} - A4K**`,
					`**◎ Error:** Incorrect usage! Please use \`${prefix}airreps <search>\``);
			message.channel.send({ embeds: [incorrectFormat] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const searchTerm = args.join('%20');

		fetch.default(`https://www.reddit.com/r/AirReps/search.json?q=${searchTerm}&restrict_sr=1&limit=3`)
			.then(res => res.json())
			.then(res => res.data.children)
			.then(res => {
				const embed = new EmbedBuilder()
					.setAuthor({ name: `${res[0].data.subreddit} - Top 3 results for: ${args.join(' ')}`, iconURL: 'https://styles.redditmedia.com/t5_2oemly/styles/communityIcon_vzp0ymwfksz41.png?width=256&s=96596caa93f51c37505a2cecf33f2abdb8d93d87' })
					.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
					.setDescription(`[**◎ ${res[0].data.title}**](${res[0].data.url})\n \`\`\`${res[0].data.selftext.substring(0, 150)}...\`\`\`\n
					[**◎ ${res[1].data.title}**](${res[1].data.url})\n  \`\`\`${res[1].data.selftext.substring(0, 150)}...\`\`\`\n
					[**◎ ${res[2].data.title}**](${res[2].data.url})\n  \`\`\`${res[2].data.selftext.substring(0, 150)}...\`\`\`\n
					[**__Search Results...__**](https://www.reddit.com/r/AirReps/search/?q=${searchTerm}&restrict_sr=1)`);
				message.channel.send({ embeds: [embed] });
			}).catch(() => {
				this.client.utils.messageDelete(message, 10000);
				const embed = new EmbedBuilder()
					.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
					.addField(`**${this.client.user.username} - AirReps**`,
						`**◎ Error:** No results found!`);
				message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			});
	}

};
