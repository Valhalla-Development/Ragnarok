const Command = require('../../Structures/Command');
const { EmbedBuilder } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['pong'],
			description: 'Displays bot and API ping.',
			category: 'Informative'
		});
	}

	async run(message) {
		const msg = await message.channel.send({ content: 'Pinging...' });

		const latency = msg.createdTimestamp - message.createdTimestamp;

		this.client.utils.deletableCheck(msg, 0);

		const embed = new EmbedBuilder()
			.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
			.addFields([{ name: `**${this.client.user.username} - Ping**`, value: `**◎ Bot Latency:** \`${latency}ms\`
				**◎ API Latency:** \`${Math.round(this.client.ws.ping)}ms\`` }]);
		message.channel.send({ embeds: [embed] });
	}

};
