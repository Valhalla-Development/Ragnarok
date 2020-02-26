const { MessageAttachment } = require('discord.js');
const { idiotToken } = require('../../storage/config.json');

module.exports = {
	config: {
		name: 'beautiful',
		usage: '${prefix}beautiful <@user>',
		category: 'generators',
		description: 'Generates a beautiful image',
		aliases: ['beauty', 'adore'],
		accessableby: 'Everyone',
	},
	run: async (bot, message) => {
		const Idiot = require('idiotic-api');
		bot.API = new Idiot.Client(idiotToken, { dev: true });

		message.delete();
		const user = message.mentions.users.first();
		if (!user) {
			message.channel.send('You must tag a user!');
			return;
		}
		await message.channel.send(
			new MessageAttachment(
				await bot.API.beautiful(
					user.displayAvatarURL({ format: 'png', size: 128 })
				),
				'beautiful.png'
			)
		);
	},
};
