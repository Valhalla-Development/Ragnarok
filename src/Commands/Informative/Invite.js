const Command = require('../../Structures/Command');
const { ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
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
			.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
			.addFields({ name: `**${this.client.user.username} - Ping**`,
				value: `Want to invite ${this.client.user}?` });

		const buttonA = new ButtonBuilder()
			.setStyle(ButtonStyle.Link)
			.setLabel('Invite')
			.setURL('https://discordapp.com/oauth2/authorize?client_id=508756879564865539&scope=bot%20applications.commands&permissions=1514550062326');

		const row = new ActionRowBuilder()
			.addComponents(buttonA);

		await message.channel.send({ components: [row], embeds: [embed] });
	}

};
