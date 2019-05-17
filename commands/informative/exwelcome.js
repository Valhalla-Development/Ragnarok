const { MessageEmbed } = require('discord.js');
const { ownerID } = require('../../storage/config.json');

module.exports = {
	config: {
		name: 'exwelcome',
		usage: '${prefix}exwelcome',
		category: 'informative',
		description: ' ',
		accessableby: 'Staff',
	},
	run: async (bot, message) => {
		const language = require('../../storage/messages.json');

		if (
			!message.member.hasPermission('MANAGE_GUILD') &&
			message.author.id !== ownerID
		) {
			message.channel.send(`${language.setwelcome.noPermission}`);
			return;
		}

		const exwelcome = new MessageEmbed()
			.setTitle('Title')
			.setAuthor('Author')
			.setColor(3447003)
			.setDescription('Description')
			.setThumbnail(message.author.avatarURL());

		message.channel.send(exwelcome);
	},
};
