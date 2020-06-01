const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	async run(message) {
		const user = message.mentions.users.first() || message.author;

		const embed = new MessageEmbed()
			.setAuthor(`${user.username}'s Avatar`)
			.setImage(user.avatarURL({ dynamic: true, size: 1024 }))
			.setColor('36393F');
		message.channel.send(embed);
	}

};
