const { MessageEmbed } = require('discord.js');
const hastebin = require('hastebin-gen');

module.exports = {
	config: {
		name: 'hastebin',
		usage: '${prefix}hastebin <text>',
		category: 'fun',
		description: 'Posts args to hastebin',
		accessableby: 'Everyone',
	},
	run: async (bot, message, args) => {
		message.delete();
		if (args[0] == undefined) {
			const embed = new MessageEmbed()
				.setColor('RANDOM')
				.setDescription(':x: | You must input some text');
			message.channel.send(embed);
			return;
		}

		hastebin(args.join(' '))
			.then(r => {
				const hastEmb = new MessageEmbed()
					.setColor('RANDOM')
					.setURL(r)
					.addField('Hastebin Link: ', `${r}`);
				message.channel.send(hastEmb);
			})
			.catch(
				message.channel
					.send(':cry: An error occured, please try again later.')
					.then(m => m.delete({ timeout: 5000 }))
			)
			.then(console.error);
	},
};
