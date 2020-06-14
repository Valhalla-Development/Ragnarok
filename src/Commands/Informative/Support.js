const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays an invite link to the bots support server..',
			category: 'Informative',
			usage: 'Support'
		});
	}

	async run(message) {
		const embed = new MessageEmbed()
			.setColor('36393F')
			.setDescription(':white_check_mark: **Support Server Invite**: https://discord.gg/Q3ZhdRJ');
		message.channel.send(embed);
	}

};
