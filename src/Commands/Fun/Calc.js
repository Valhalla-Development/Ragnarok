/* eslint-disable new-cap */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const math = require('mathjs');
const { Calculator } = require('sudo-minigames');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['math'],
			description: 'Calculates given input.',
			category: 'Fun',
			usage: '<input> || <easy>'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		if (args[0] === 'easy') {
			await Calculator({
				message: message,
				embed: {
					title: 'Calculator | Ragnarok',
					color: this.client.utils.color(message.guild.me.displayHexColor),
					footer: ' ',
					timestamp: false
				},
				disabledQuery: 'Calculator is disabled!',
				invalidQuery: 'The provided equation is invalid!',
				othersMessage: 'Only <@{{author}}> can use the buttons!'
			});
			return;
		}

		if (!args[0]) {
			this.client.utils.messageDelete(message, 10000);

			const incorrectFormat = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Calculation**`,
					`**◎ Error:** Please input a calculation! Example: \`${prefix}calc 1+1\`\n\nAlternatively, you can run \`${prefix}calc easy\``);
			message.channel.send({ embeds: [incorrectFormat] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		let resp;
		try {
			resp = math.evaluate(args.join(' '));
		} catch (err) {
			this.client.utils.messageDelete(message, 10000);

			const invalidInput = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Calculation**`,
					`**◎ Error:** Please input a valid calculation!`);
			message.channel.send({ embeds: [invalidInput] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Calculation**`,
				`**◎ Input:** \`\`\`js\n${args.join('')}\`\`\`
				**◎ Output:** \`\`\`js\n${resp}\`\`\``)
			.setTimestamp();
		message.channel.send({ embeds: [embed] });
	}

};
