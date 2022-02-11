const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['sayreply'],
			description: 'Reply to a message as the bot.',
			category: 'Moderation',
			usage: '<channel id> <message id> <text>',
			userPerms: ['MANAGE_GUILD']
		});
	}

	async run(message, args) {
		this.client.utils.messageDelete(message, 0);

		if (args[0] === undefined) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Reply**`,
					`**◎ Error:** You need to input a channel ID!\n(This is requried to prevent the bot from spamming the API, searching for a specific message within several channels.)`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (args[1] === undefined) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Reply**`,
					`**◎ Error:** You need to input a message ID`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (args[2] === undefined) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Reply**`,
					`**◎ Error:** You need to input text you wish to reply with!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const channel = message.guild.channels.cache.get(args[0]);
		const fetchMessage = channel.messages.fetch(args[1]);

		try {
			fetchMessage.then(async (msg) => {
				msg.reply(args.slice(2).join(' '));
			});
		} catch {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Reply**`,
					`**◎ Error:** An error occured while trying to reply to the message!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
	}

};
