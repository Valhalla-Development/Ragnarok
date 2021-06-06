const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

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

module.exports = {
	name: 'meme',
	description: 'Fetches a random Meme from several sub-reddits.',
	async run({ interaction }) {
		await interaction.reply('Generating...').then(async (m) => {
			const res = await fetch(`https://www.reddit.com/r/${subreddits[Math.floor(Math.random() * subreddits.length)]}/hot.json`);
			const { data } = await res.json();

			function clean(url) {
				const lastOf = url.lastIndexOf('.');
				const output = url.substring(lastOf);
				return allowedExt.includes(output);
			}

			const allowed = data.children.filter((post) => clean(post.data.url));

			const safe = interaction.channel.nsfw ? allowed : allowed.filter((post) => !post.data.over_18);

			if (!safe.length) {
				const noPost = new MessageEmbed()
					.setColor('A10000')
					.addField(`**Ragnarok - Meme**`,
						`**◎ Error:** I could not find a post.`);
				m.edit('', { embed: noPost });
				return;
			}

			const post = safe[Math.floor(Math.random() * safe.length)];
			let postURL;

			if (post.data.url.slice(-4) === 'gifv') {
				postURL = post.data.url.slice(0, -1);
			} else {
				postURL = post.data.url;
			}

			const cmp = [
				{
					type: 1, components: [
						{ type: 2, style: 1, label: 'Button 1', custom_id: '1' },
						{ type: 2, style: 4, label: 'Button 2', custom_id: '2' }
					]
				}
			];

			const embed = new MessageEmbed()
				.setColor('A10000')
				.setAuthor(`${post.data.title}`, interaction.user.displayAvatarURL({ dynamic: true }), `https://reddit.com${post.data.permalink}`)
				.setImage(postURL)
				.setFooter(`👍 ${post.data.ups} | 💬 ${post.data.num_comments}`);
			m.edit('', { components: cmp, type: 4, embed: embed });
		});
	}
};
