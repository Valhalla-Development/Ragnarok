const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = class extends Command {

	async run(message) {
		const msg = await message.channel.send('Generating...');
		message.channel.startTyping();

		const res = await fetch(`https://www.reddit.com/r/DoctorWhumour.json?sort=top&t=week`);
		const { data } = await res.json();

		const safe = message.channel.nsfw ? data.children : data.children.filter((post) => !post.data.over_18);
		if (!safe.length) {
			const noPost = new MessageEmbed()
				.setColor('36393F')
				.setDescription(`Couldn't get the post.`);
			message.channel.send(noPost);
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
			.setColor('36393F')
			.setAuthor(
				`${post.data.title}`,
				message.author.displayAvatarURL({ dynamic: true }),
				`https://reddit.com${post.data.permalink}`
			)
			.setImage(postURL)
			.setFooter(`👍 ${post.data.ups} | 💬 ${post.data.num_comments}`);
		message.channel.send(embed);

		message.channel.stopTyping();
		msg.delete();
	}

};
