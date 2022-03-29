const Command = require('../../Structures/Command');
const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const fetch = require('node-fetch-cjs');
const comCooldown = new Set();
const comCooldownSeconds = 10;

const subreddits = [
	'memes',
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
		if (comCooldown.has(message.author.id)) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Meme**`,
					`**◎ Error:** Please only run this command once.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

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
					`**◎ Error:** I could not find a post.`);
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
			.setAuthor({ name: `${post.data.title}`, url: `https://reddit.com${post.data.permalink}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
			.setImage(postURL)
			.setFooter({ text: `👍 ${post.data.ups} | 💬 ${post.data.num_comments}` });

		const buttonA = new MessageButton()
			.setStyle('PRIMARY')
			.setLabel('Next Meme')
			.setCustomId('nxtmeme');

		const row = new MessageActionRow()
			.addComponents(buttonA);

		const m = await message.channel.send({ components: [row], embeds: [embed] });

		const filter = (but) => but.user.id !== this.client.user.id;

		const collector = m.createMessageComponentCollector(filter, { time: 15000 });

		if (!comCooldown.has(message.author.id)) {
			comCooldown.add(message.author.id);
		}
		setTimeout(() => {
			if (comCooldown.has(message.author.id)) {
				comCooldown.delete(message.author.id);
			}
		}, comCooldownSeconds * 1000);

		collector.on('collect', async b => {
			if (b.user.id !== message.author.id) {
				const wrongUser = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Meme**`,
						`**◎ Error:** Only the command executor can select an option!`);
				b.reply({ embeds: [wrongUser], ephemeral: true });
				return;
			}

			collector.resetTimer();

			if (b.customId === 'nxtmeme') {
				const postNew = safe[Math.floor(Math.random() * safe.length)];
				let postURLNew;

				if (post.data.url.slice(-4) === 'gifv') {
					postURLNew = postNew.data.url.slice(0, -1);
				} else {
					postURLNew = postNew.data.url;
				}

				const newMeme = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.setAuthor({ name: `${postNew.data.title}`, url: `https://reddit.com${postNew.data.permalink}`, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
					.setImage(postURLNew)
					.setFooter({ text: `👍 ${postNew.data.ups} | 💬 ${postNew.data.num_comments}` });

				await b.update({ embeds: [newMeme], components: [row] });
			}
		});

		collector.on('end', (_, reason) => {
			if (comCooldown.has(message.author.id)) {
				comCooldown.delete(message.author.id);
			}
		});

		this.client.utils.deletableCheck(msg, 0);
	}

};
