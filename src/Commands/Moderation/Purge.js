const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			name: 'E',
			aliases: ['E'],
			description: 'E',
			category: 'E',
			usage: 'E'
		});
	}

	async run(message, args) {
		if (!message.member.hasPermission('MANAGE_MESSAGES') && !this.client.owners.includes(message.author.id)) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Invalid Perms**',
					`**◎ Error:** You need to have the \`MANAGE_MESSAGES\` permission to use this command.`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		if (!args[0]) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Incorrect Usage**',
					`**◎ Error:** You need to specify the amount of messages to purge!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		if (isNaN(args[0])) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Incorrect Usage**',
					`**◎ Error:** The provided argument is not a valid number.`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		if (args[0] < 1) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Incorrect Usage**',
					`**◎ Error:** You need to specify the amount of messages to purge!`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		let amt;
		if (args[0] > 100) {
			amt = 100;
		} else {
			amt = await message.channel.messages.fetch({ limit: parseInt(args[0]) });
		}

		try {
			await message.channel.bulkDelete(amt);
			message.channel.bulkDelete(args[0]).then(() => {
				setTimeout(() => {
					const embed = new MessageEmbed()
						.setColor(message.guild.me.displayHexColor || '36393F')
						.addField('**Success**',
							`**◎ Success:** Successfully deleted ${args[0]} messages!`);
					message.channel.send(embed).then((m) => {
						setTimeout(() => {
							m.delete();
						}, 5000);
					});
				}, 2000);
			}).catch((error) => {
				console.log(error);
			});
		} catch (e) {
			const embed = new MessageEmbed()
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Invalid Messages**',
					`**◎ Error:** You can not delete messages older than 14 days.`);
			message.channel.send(embed).then((m) => m.delete({ timeout: 15000 }));
		}
	}

};
