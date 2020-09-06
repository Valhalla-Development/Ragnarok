const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['echo'],
			description: 'Makes the bot post given text.',
			category: 'Moderation',
			usage: '<text>',
			requiredPermission: 'MANAGE_MESSAGES'
		});
	}

	async run(message, args) {
		this.client.utils.messageDelete(message, 0);

		if (args[0] === undefined) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Say**`,
					`**◎ Error:** You need to input text!`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const sayMessage = args.join(' ');

		message.channel.send(sayMessage);
	}

};
