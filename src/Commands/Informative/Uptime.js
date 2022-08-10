const Command = require('../../Structures/Command');
const { EmbedBuilder } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays bot uptime.',
			category: 'Informative'
		});
	}

	async run(message) {
		const nowInMs = Date.now() - this.client.uptime;
		const nowInSecond = Math.round(nowInMs / 1000);

		const botembed = new EmbedBuilder()
			.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
			.addField(`**${this.client.user.username} - Uptime**`,
				`**◎ My uptime is:** <t:${nowInSecond}:R>`);
		message.channel.send({ embeds: [botembed] });
	}

};
