const { MessageAttachment } = require('discord.js');
const { idiotToken } = require('../../storage/config.json');

module.exports = {
	config: {
		name: 'slap',
		usage: '${prefix}slap <@user>',
		category: 'generators',
		description: 'Slaps a user',
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
				await bot.API.batSlap(
					message.author.displayAvatarURL({ format: 'png', size: 128 }),
					user.displayAvatarURL({ format: 'png', size: 128 })
				),
				'batslap.png'
			)
		);
	},
};
