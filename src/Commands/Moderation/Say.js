const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['echo'],
			description: 'Makes the bot post given text.',
			category: 'Moderation',
			usage: '<text>'
		});
	}

	async run(message, args) {
		this.client.utils.messageDelete(message, 0);

		if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Say**`,
					`**◎ Error:** Only the server's managers can use this command!`);
			message.channel.send(embed).then((m) => this.client.utils.messageDelete(m, 15000));
			return;
		}

		if (args[0] === undefined) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Say**`,
					`**◎ Error:** You need to input text!`);
			message.channel.send(embed).then((m) => this.client.utils.messageDelete(m, 15000));
			return;
		}

		const sayMessage = args.join(' ');

		message.channel.send(sayMessage);
	}

};
