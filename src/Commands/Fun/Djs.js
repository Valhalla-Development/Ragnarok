const Command = require('../../Structures/Command');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays search results in the D.js documentation.',
			category: 'Fun',
			usage: '<input>'
		});
	}

	async run(message, ...query) {
		if (!query) {
			this.client.utils.messageDelete(message, 10000);

			const noInput = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Discord.js**`,
					`**◎ Error:** You must input a search term!`);
			message.channel.send(noInput).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const url = `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(query)}`;

		const docFetch = await fetch(url);
		const embed = await docFetch.json();

		if (!embed || embed.error) {
			this.client.utils.messageDelete(message, 10000);

			const noResult = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Discord.js**`,
					`**◎ Error:** I found no results for\n\`${query}\``);
			message.channel.send(noResult).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const msg = await message.channel.send({ embed });
		msg.react('🗑');

		let react;
		try {
			react = await msg.awaitReactions(
				(reaction, user) => reaction.emoji.name === '🗑' && user.id === message.author.id,
				{ max: 1, time: 10000, errors: ['time'] }
			);
		} catch (error) {
			msg.reactions.removeAll();
		}

		if (react && react.first()) {
			this.client.utils.deletableCheck(msg, 0);
			this.client.utils.messageDelete(message, 0);
		}
	}

};
