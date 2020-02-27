const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'support',
		usage: '${prefix}support',
		category: 'informative',
		description: 'Posts a link to the bots support server',
		accessableby: 'Everyone',
	},
	run: async (bot, message) => {

		const embed = new MessageEmbed()
			.setColor('36393F')
			.setDescription(
				':white_check_mark: **Support Server Invite**: https://discord.gg/Q3ZhdRJ'
			);
		message.channel.send(embed);
	},
};
