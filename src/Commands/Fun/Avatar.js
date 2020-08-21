const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['pfp'],
			description: 'Fetches message author/tagged user profile picture.',
			category: 'Fun',
			usage: '[@tag]'
		});
	}

	async run(message) {
		const user = message.mentions.users.first() || message.author;

		const embed = new MessageEmbed()
			.setAuthor(`${user.username}'s Avatar`)
			.setImage(user.avatarURL({ dynamic: true, size: 1024 }))
			.setColor(message.guild.me.displayHexColor || '36393F');
		message.channel.send(embed);
	}

};
