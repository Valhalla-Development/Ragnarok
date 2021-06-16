const Command = require('../../Structures/Command');
const { MessageButton, MessageActionRow } = require('discord-buttons');
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
			.addField(`**${this.client.user.username} - Ping**`,
				`Want to invite ${this.client.user}?`);

		const buttonA = new MessageButton()
			.setStyle('url')
			.setLabel('Invite')
			.setURL('https://discordapp.com/oauth2/authorize?client_id=508756879564865539&scope=bot%20applications.commands&permissions=1580723711');

		const row = new MessageActionRow()
			.addComponent(buttonA);

		await message.channel.send({ component: row, embeds: [embed] });
	}

};
