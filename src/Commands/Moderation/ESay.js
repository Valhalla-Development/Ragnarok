const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['embed'],
			description: 'Posts given input in an embed.',
			category: 'Moderation',
			usage: '<text>'
		});
	}

	async run(message, args) {
		if (message.member.guild.me.hasPermission('MANAGE_MESSAGES')) {
			message.delete();
		}

		if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || 'A10000')
				.addField(`**${this.client.user.username} - ESay**`,
					`**◎ Error:** Only the server's managers can use this command!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		if (args[0] === undefined) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || 'A10000')
				.addField(`**${this.client.user.username} - ESay**`,
					`**◎ Error:** You need to input text!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		const sayMessage = args.join(' ');

		const embed = new MessageEmbed()
			.setColor(message.guild.me.displayHexColor || 'A10000')
			.setDescription(`${sayMessage}`);
		message.channel.send(embed);
	}

};
