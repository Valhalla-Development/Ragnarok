const Command = require('../../Structures/Command');
const { EmbedBuilder, MessageAttachment } = require('discord.js');
const DIG = require('discord-image-generation');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Generate a Kiss image!',
			category: 'Generators',
			usage: '<@tag>'
		});
	}

	async run(message) {
		this.client.utils.messageDelete(message, 0);

		const user = message.mentions.members.first();

		if (!user) {
			const incorrectFormat = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Kiss**`,
					`**◎ Error:** Incorrect usage! Please tag a user!`);
			message.channel.send({ embeds: [incorrectFormat] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const img = await new DIG.Kiss().getImage(message.author.displayAvatarURL({ dynamic: false, format: 'png' }), user.user.displayAvatarURL({ dynamic: false, format: 'png' }));
		const attach = new MessageAttachment(img, 'Kiss.png');
		message.channel.send({ files: [attach] });
		return;
	}

};
