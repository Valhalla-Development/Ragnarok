const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const math = require('mathjs');
const language = require('../../../Storage/messages.json');

module.exports = class extends Command {

	async run(message, args) {
		if (!args[0]) {
			message.channel.send(`${language.calc.noInput}`);
			return;
		}

		let resp;
		try {
			resp = math.evaluate(args.join(' '));
		} catch (err) {
			message.channel.send(`${language.calc.invalidInput}`);
			return;
		}

		const embed = new MessageEmbed()
			.setColor('36393F')
			.setTitle('Calculation')
			.addFields({ name: 'Input', value: `\`\`\`js\n${args.join('')}\`\`\`` },
				{ name: 'Output', value: `\`\`\`js\n${resp}\`\`\`` });

		message.channel.send(embed);
	}

};
