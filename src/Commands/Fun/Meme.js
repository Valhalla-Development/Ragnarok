const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch-cjs');

const subreddits = [
	'memes',
	'DeepFriedMemes',
	'bonehurtingjuice',
	'surrealmemes',
	'dankmemes',
	'meirl',
	'me_irl',
	'funny'
];

const allowedExt = [
	'.jpg',
	'.jpeg',
	'.gif',
	'.gifv',
	'.png'
];

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['funny'],
			description: 'Fetches a random Meme from several sub-reddits.',
			category: 'Fun'
		});
	}

	async run(message) {
		const msg = await message.channel.send({ content: 'Generating...' });
		message.channel.sendTyping();

		const res = await fetch.default(`https://www.reddit.com/r/${subreddits[Math.floor(Math.random() * subreddits.length)]}/hot.json`);
		const { data } = await res.json();

		function clean(url) {
			const lastOf = url.lastIndexOf('.');
			const output = url.substring(lastOf);
			return allowedExt.includes(output);
		}

		const allowed = data.children.filter((post) => clean(post.data.url));

		const safe = message.channel.nsfw ? allowed : allowed.filter((post) => !post.data.over_18);

		if (!safe.length) {
			this.client.utils.messageDelete(message, 10000);

			const noPost = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Meme**`,
					`**◎ Error:** I could not find a psot.`);
			message.channel.send({ embeds: [noPost] }).then((m) => this.client.utils.deletableCheck(m, 10000));
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
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setAuthor(`${post.data.title}`, message.author.displayAvatarURL({ dynamic: true }), `https://reddit.com${post.data.permalink}`)
			.setImage(postURL)
			.setFooter(`👍 ${post.data.ups} | 💬 ${post.data.num_comments}`);
		message.channel.send({ embeds: [embed] });

		this.client.utils.deletableCheck(msg, 0);
	}

};
