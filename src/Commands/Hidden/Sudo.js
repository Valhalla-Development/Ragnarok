/* eslint-disable new-cap */
const Command = require('../../Structures/Command');
const { EmbedBuilder } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'sudo message',
			category: 'Hidden',
			userPerms: ['ManageMessages'],
			botPerms: ['ManageWebhooks']
		});
	}

	async run(message, args) {
		const user = message.mentions.users.size ? message.guild.members.members.cache.get(message.mentions.users.first().id) : message.guild.members.members.cache.get(args[0]);

		this.client.utils.messageDelete(message, 0);

		if (!user) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Sudo**`,
					value: `**◎ Error:** Please mention a user or paste a user ID.` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!args[1]) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Reload**`,
					value: `**◎ Error:** Please specify the text you wish me to sudo!` });
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const text = args.slice(1).join(' ');

		this.client.functions.sudo(message, text, user);
	}

};
