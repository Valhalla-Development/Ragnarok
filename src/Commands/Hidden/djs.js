const Command = require('../../Structures/Command');
const fetch = require('node-fetch');

module.exports = class extends Command {

	async run(message, args) {
		const query = args.join(' ');
		const url = `https://djsdocs.sorta.moe/v2/embed?src=stable&q=${encodeURIComponent(query)}`;
		fetch(url)
			.then(res => res.json())
			.then(embed => {
				if (embed && !embed.error) {
					message.channel.send({ embed });
				} else {
					message.reply(`I found no results for ${query}.`);
				}
			})
			.catch(err => {
				console.error(err);
				message.reply('An error occured :slight_frown:');
			});
	}

};
