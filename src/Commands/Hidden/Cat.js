const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

const subreddits = [
	'cat',
	'cats',
	'catpics',
	'kittens'
];

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Fetches a random meme from several sub-reddits.',
			category: 'Hidden'
		});
	}

	async run(message) {
		const msg = await message.channel.send('Generating...');
		message.channel.startTyping();

		const res = await fetch(`https://www.reddit.com/r/${subreddits[Math.floor(Math.random() * subreddits.length)]}/hot.json`);
		const { data } = await res.json();

		const safe = message.channel.nsfw ? data.children : data.children.filter((post) => !post.data.over_18);
		if (!safe.length) {
			const noPost = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || 'A10000')
				.addField(`**${this.client.user.username} - Meme**`,
					`**◎ Error:** I could not find a psot.`);
			message.channel.send(noPost).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const post = safe[Math.floor(Math.random() * safe.length)];
		let postURL;

		if (post.data.url.slice(-4) === 'gifv') {
			postURL = post.data.url.slice(0, -1);
		} else {
			postURL = post.data.url;
		}
		const embed = new MessageEmbed()
			.setColor(message.guild.me.displayHexColor || 'A10000')
			.setAuthor(`${post.data.title}`, message.author.displayAvatarURL({ dynamic: true }), `https://reddit.com${post.data.permalink}`)
			.setImage(postURL)
			.setFooter(`👍 ${post.data.ups} | 💬 ${post.data.num_comments}`);
		message.channel.send(embed);

		message.channel.stopTyping();
		msg.delete();
	}

};
