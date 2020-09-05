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

	async run(message, args) {
		if (!args[0]) {
			const noInput = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Discord.js**`,
					`**◎ Error:** You must input a search term!`);
			message.channel.send(noInput).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const query = args.join(' ');
		const url = `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(query)}`;
		fetch(url)
			.then(res => res.json())
			.then(embed => {
				if (embed && !embed.error) {
					message.channel.send({ embed });
				} else {
					const noResult = new MessageEmbed()
						.setColor(this.client.utils.color(message.guild.me.displayHexColor))
						.addField(`**${this.client.user.username} - Discord.js**`,
							`**◎ Error:** I found no results for\n\`${query}\``);
					message.channel.send(noResult).then((m) => this.client.utils.deletableCheck(m, 10000));
				}
			})
			.catch(err => {
				console.error(err);
				const error = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Discord.js**`,
						`**◎ Error:** An error occured :slight_frown:`);
				message.channel.send(error).then((m) => this.client.utils.deletableCheck(m, 10000));
			});
	}

};
