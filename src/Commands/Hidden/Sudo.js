/* eslint-disable new-cap */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const { sudo } = require('weky');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'sudo message',
			category: 'Hidden',
			userPerms: ['MANAGE_MESSAGES'],
			botPerms: ['MANAGE_WEBHOOKS']
		});
	}

	async run(message, args) {
		const user = message.mentions.users.size ? message.guild.members.cache.get(message.mentions.users.first().id) : message.guild.members.cache.get(args[0]);

		this.client.utils.messageDelete(message, 0);

		if (!user) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Sudo**`,
					`**◎ Error:** Please mention a user or paste a user ID.`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!args[1]) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Reload**`,
					`**◎ Error:** Please specify the text you wish me to sudo!`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const msg = args.slice(1).join(' ');
		const xd = new sudo({
			message: message,
			text: msg,
			member: user
		});
		xd.start();
	}

};
