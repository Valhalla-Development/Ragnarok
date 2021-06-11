const Command = require('../../Structures/Command');
const { MessageAttachment } = require('discord.js');
const DIG = require('discord-image-generation');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Generate a Stonk image!',
			category: 'Generators',
			usage: '[@tag]'
		});
	}

	async run(message) {
		this.client.utils.messageDelete(message, 0);
		let avatar;

		if (message.mentions.members.first()) {
			avatar = message.mentions.members.first().user.displayAvatarURL({ dynamic: false, format: 'png' });
		} else {
			avatar = message.author.displayAvatarURL({ dynamic: false, format: 'png' });
		}

		const img = await new DIG.Stonk().getImage(avatar);
		const attach = new MessageAttachment(img, 'Stonk.png');
		message.channel.send({ files: [attach] });
		return;
	}

};
