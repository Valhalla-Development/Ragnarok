const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const language = require('../../../Storage/messages.json');

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

		const msg = await message.channel.send('Generating...');
		message.channel.startTyping();

		const searchTerm = args.join('%20');
		const argsNonJoin = args.join(' ');

		const embed = new MessageEmbed()
			.setAuthor('Reddit - A4K', 'http://i.imgur.com/sdO8tAw.png')
			.setColor('36393F')
			.setDescription(`Search Results For - ${argsNonJoin}\n[Click Me!](https://www.reddit.com/r/Addons4Kodi/search/?q=${searchTerm}&restrict_sr=1)`);
		message.channel.send(embed);


		/* fetch(`https://www.reddit.com/r/Addons4Kodi/search.json?q=${searchTerm}&restrict_sr=1`)
            .then(res => res.json())
            .then(res => res.data.children)
            .then(res =>
                res.json(post => ({
                    link: post.data.url,
                    title: post.data.title,
                    subreddit: post.data.subreddit
                }))
            )
            .then(res => res.map(render));

        const render = post => {
            console.log(post)
            message.channel.send(post.subreddit)

            const embed = new MessageEmbed()
                .setAuthor(post.subreddit, 'http://i.imgur.com/sdO8tAw.png')
                .setColor('36393F')
                .setDescription(`Search Results: [Click Me!](https://www.reddit.com/r/Addons4Kodi/search/?q=${searchTerm}&restrict_sr=1)\n\n`)
            message.channel.send(embed);
        }; */
		message.channel.stopTyping();
		msg.delete();
	}

};
