const Command = require('../../Structures/Command');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays search results in the D.js documentation.',
			category: 'Fun',
			usage: 'Djs <input>'
		});
	}

	async run(message, args) {
		if (!args[0]) {
			const noInput = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Incorrect Usage**',
					`**◎ Error:** You must input a search term!`);
			message.channel.send(noInput).then((m) => m.delete({ timeout: 15000 }));
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
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Incorrect Usage**',
							`**◎ Error:** I found no results for\n\`${query}\``);
					message.channel.send(noResult).then((m) => m.delete({ timeout: 15000 }));
				}
			})
			.catch(err => {
				console.error(err);
				const error = new MessageEmbed()
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Error**',
						`**◎ Error:** An error occured :slight_frown:`);
				message.channel.send(error).then((m) => m.delete({ timeout: 15000 }));
			});
	}

};
