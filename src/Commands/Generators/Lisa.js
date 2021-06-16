const Command = require('../../Structures/Command');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const DIG = require('discord-image-generation');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Generate a Lisa image!',
			category: 'Generators',
			usage: '<text>'
		});
	}

	async run(message, args) {
		this.client.utils.messageDelete(message, 0);

		const text = args.join(' ');

		if (!text) {
			const incorrectFormat = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Lisa**`,
					`**◎ Error:** Incorrect usage! Please input some text`);
			message.channel.send({ embeds: [incorrectFormat] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (text.length > 300) {
			const incorrectFormat = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Lisa**`,
					`**◎ Error:** Incorrect usage! Please input a maximum of 300 characters!`);
			message.channel.send({ embeds: [incorrectFormat] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const img = await new DIG.LisaPresentation().getImage(text);
		const attach = new MessageAttachment(img, 'Lisa.png');
		message.channel.send({ files: [attach] });
		return;
	}

};
