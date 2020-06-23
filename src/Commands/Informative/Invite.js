const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays an invite link for the bot.',
			category: 'Informative',
			usage: 'Invite'
		});
	}

	async run(message) {
		const embed = new MessageEmbed()
			.setColor('36393F')
			.setDescription(`:white_check_mark: [**Bot Invite Link**](https://discordapp.com/oauth2/authorize?client_id=${this.client.user.id}&scope=bot&permissions=2050485471)`);
		message.channel.send(embed);
	}

};
