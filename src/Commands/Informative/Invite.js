const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays an invite link for the bot.',
			category: 'Informative',
			botPerms: ['EMBED_LINKS']
		});
	}

	async run(message) {
		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Invite**`,
				`**◎ [Bot Invite Link](https://discordapp.com/oauth2/authorize?client_id=${this.client.user.id}&scope=bot%20applications.commands&permissions=1580723711)**`);
		message.channel.send(embed);
	}

};
