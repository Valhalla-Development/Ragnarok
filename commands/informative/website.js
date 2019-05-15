const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'website',
		usage: '${prefix}website',
		category: 'informative',
		description: 'Posts a link to the bots website',
		accessableby: 'Everyone',
	},
	run: async (bot, message) => {
		message.delete();

		const embed = new MessageEmbed()
			.setColor('36393F')
			.setDescription(
				':globe_with_meridians: **Website:** https://www.ragnarokbot.tk/'
			);
		message.channel.send(embed);
	},
};
