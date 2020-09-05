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
		this.client.utils.messageDelete(message, 0);

		if (!message.member.hasPermission('MANAGE_GUILD') && !this.client.owners.includes(message.author.id)) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - ESay**`,
					`**◎ Error:** Only the server's managers can use this command!`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (args[0] === undefined) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - ESay**`,
					`**◎ Error:** You need to input text!`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const sayMessage = args.join(' ');

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setDescription(`${sayMessage}`);
		message.channel.send(embed);
	}

};
