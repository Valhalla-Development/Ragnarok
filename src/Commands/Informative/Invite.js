const Command = require('../../Structures/Command');
const { MessageButton, MessageActionRow } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays an invite link for the bot.',
			category: 'Informative',
			botPerms: ['EmbedLinks']
		});
	}

	async run(message) {
		const embed = new EmbedBuilder()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Ping**`,
				`Want to invite ${this.client.user}?`);

		const buttonA = new MessageButton()
			.setStyle('LINK')
			.setLabel('Invite')
			.setURL('https://discordapp.com/oauth2/authorize?client_id=508756879564865539&scope=bot%20applications.commands&permissions=1514550062326');

		const row = new MessageActionRow()
			.addComponents(buttonA);

		await message.channel.send({ components: [row], embeds: [embed] });
	}

};
