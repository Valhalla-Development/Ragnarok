const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const math = require('mathjs');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['math'],
			description: 'Calculates given input.',
			category: 'Fun',
			usage: '<input>'
		});
	}

	async run(message, args) {
		if (!args[0]) {
			const incorrectFormat = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Calculation**`,
					`**◎ Error:** Please input a calculation!`);
			message.channel.send(incorrectFormat).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		let resp;
		try {
			resp = math.evaluate(args.join(' '));
		} catch (err) {
			const invalidInput = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Calculation**`,
					`**◎ Error:** Please input a valid calculation!`);
			message.channel.send(invalidInput).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Calculation**`, [
				`**◎ Input:** \`\`\`js\n${args.join('')}\`\`\``,
				`**◎ Output:** \`\`\`js\n${resp}\`\`\``
			])
			.setTimestamp();
		message.channel.send(embed);
	}

};
