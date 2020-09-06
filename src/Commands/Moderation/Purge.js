const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Deletes specified amount of messages from the channel.',
			category: 'Moderation',
			usage: '<amount of messages to delete>',
			requiredPermission: 'MANAGE_MESSAGES'
		});
	}

	async run(message, args) {
		if (!args[0]) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Purge**`,
					`**◎ Error:** You need to specify the amount of messages to purge!`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
		if (isNaN(args[0])) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Purge**`,
					`**◎ Error:** The provided argument is not a valid number.`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
		if (args[0] < 1) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Purge**`,
					`**◎ Error:** You need to specify the amount of messages to purge!`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		// test it bub
		/* let total = 0;
		function purge(message, count = 2) {
			if (count > 1000) return 'Nope!';
			if (count >= 100) {
				message.channel.bulkDelete(100).then((x) => {
					total += x.size;
					return purge(count -= 100);
				});
			} else {
				message.channel.bulkDelete(count).then((x) => {
					total += x.size;
					return `Purged ${total}`;
				});
			}
		}*/

		let amt;
		if (args[0] > 100) {
			amt = 100;
		} else {
			amt = await message.channel.messages.fetch({ limit: parseInt(args[0]) });
		}

		try {
			await message.channel.bulkDelete(amt);
			message.channel.bulkDelete(args[0]).then(() => {
				const embed = new MessageEmbed()
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Purge**`,
						`**◎ Success:** Successfully deleted ${args[0]} messages!`);
				message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 13000));
			}).catch((error) => {
				console.log(error);
			});
		} catch (e) {
			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Purge**`,
					`**◎ Error:** You can not delete messages older than 14 days.`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
		}
	}

};
