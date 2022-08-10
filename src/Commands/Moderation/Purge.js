const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Deletes specified amount of messages from the channel.',
			category: 'Moderation',
			usage: '<amount of messages to delete>',
			userPerms: ['ManageMessages'],
			botPerms: ['ManageMessages']
		});
	}

	async run(message, args) {
		if (!args[0]) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Purge**`,
					`**◎ Error:** You need to specify the amount of messages to purge!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
		if (isNaN(args[0])) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Purge**`,
					`**◎ Error:** The provided argument is not a valid number.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
		if (args[0] < 1) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Purge**`,
					`**◎ Error:** You need to specify the amount of messages to purge!`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		let messageCount = args[0];
		if (messageCount > 100) messageCount = 99;

		try {
			const fetch = await message.channel.messages.fetch({ limit: Number(messageCount) + 1 });
			await message.channel.bulkDelete(fetch, true);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Purge**`,
					`**◎ Success:** ${Number(messageCount)} message${Number(messageCount) > 1 ? 's' : ''} were removed.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
		} catch {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Purge**`,
					`**◎ Error:** An error occured.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
		}
	}

};
