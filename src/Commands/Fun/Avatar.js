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
			.setAuthor({ name: `${user.username}'s Avatar`, iconURL: user.avatarURL() })
			.setImage(user.avatarURL({ dynamic: true, size: 1024 }))
			.setColor(this.client.utils.color(message.guild.me.displayHexColor));
		message.channel.send({ embeds: [embed] });
	}

};
