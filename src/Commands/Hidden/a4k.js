const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const language = require('../../../Storage/messages.json');
const fetch = require('node-fetch');

module.exports = class extends Command {

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const incorrectUsageMessage = language.a4k.incorrectUsage;
		const incorrectUsage = incorrectUsageMessage.replace('${prefix}', prefix);

		if (!args[0]) {
			message.channel.send(incorrectUsage);
			return;
		}

		const searchTerm = args.join('%20');

		fetch(`https://www.reddit.com/r/Addons4Kodi/search.json?q=${searchTerm}&restrict_sr=1`)
			.then(res => res.json())
			.then(res => res.data.children)
			.then(res => {
				const embed = new MessageEmbed()
					.setAuthor(res[0].data.subreddit, 'http://i.imgur.com/sdO8tAw.png')
					.setColor('36393F')
					.setDescription(`\`1:\` ${res[0].data.title} [Link](${res[0].data.url})\n
					\`2:\` ${res[1].data.title} [Link](${res[1].data.url})\n
					\`3:\` ${res[2].data.title} [Link](${res[2].data.url})\n
					\`4:\` ${res[3].data.title} [Link](${res[3].data.url})\n
					\`5:\` ${res[4].data.title} [Link](${res[4].data.url})\n
					Search Results: [Link](https://www.reddit.com/r/Addons4Kodi/search/?q=${searchTerm}&restrict_sr=1)`);
				message.channel.send(embed);
			});
	}

};
