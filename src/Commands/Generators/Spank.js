const Command = require('../../Structures/Command');
const { MessageEmbed, MessageAttachment } = require('discord.js');
const DIG = require('discord-image-generation');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Generate a Spank image!',
			category: 'Generators',
			usage: '<@tag>'
		});
	}

	async run(message) {
		this.client.utils.messageDelete(message, 0);

		const user = message.mentions.members.first();

		if (!user) {
			const incorrectFormat = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Spank**`,
					`**◎ Error:** Incorrect usage! Please tag a user!`);
			message.channel.send({ embed: incorrectFormat }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const img = await new DIG.Spank().getImage(message.author.displayAvatarURL({ dynamic: false, format: 'png' }), user.user.displayAvatarURL({ dynamic: false, format: 'png' }));
		const attach = new MessageAttachment(img, 'Spank.png');
		message.channel.send({ files: [attach] });
		return;
	}

};
