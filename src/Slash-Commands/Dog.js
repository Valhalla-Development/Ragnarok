const { MessageEmbed } = require('discord.js');
const { SlashCommand } = require('slash-create');
const fetch = require('node-fetch');

const subreddits = [
	'dog',
	'dogpics',
	'puppies'
];

const allowedExt = [
	'.jpg',
	'.jpeg',
	'.gif',
	'.gifv',
	'.png'
];

module.exports = class CatCommand extends SlashCommand {

	constructor(creator) {
		super(creator, {
			name: 'dog',
			description: 'Fetches a random meme from several sub-reddits.'
		});
		this.filePath = __filename;
	}

	async run(ctx) {
		const res = await fetch(`https://www.reddit.com/r/${subreddits[Math.floor(Math.random() * subreddits.length)]}/hot.json`);
		const { data } = await res.json();

		function clean(url) {
			const lastOf = url.lastIndexOf('.');
			const output = url.substring(lastOf);
			return allowedExt.includes(output);
		}

		const allowed = data.children.filter((post) => clean(post.data.url));

		const post = allowed[Math.floor(Math.random() * allowed.length)];
		let postURL;

		if (post.data.url.slice(-4) === 'gifv') {
			postURL = post.data.url.slice(0, -1);
		} else {
			postURL = post.data.url;
		}

		const embed = new MessageEmbed()
			.setColor('#A10000')
			.setAuthor(`${post.data.title}`, ctx.user.dynamicAvatarURL(), `https://reddit.com${post.data.permalink}`)
			.setImage(postURL)
			.setFooter(`👍 ${post.data.ups} | 💬 ${post.data.num_comments}`);

		const json = embed.toJSON();

		ctx.send({ embeds: [json] });
	}

};
