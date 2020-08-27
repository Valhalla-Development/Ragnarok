const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays bot uptime.',
			category: 'Informative'
		});
	}

	async run(message) {
		const botembed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Uptime**`,
				`**◎ My uptime is:** \`${ms(this.client.uptime, { long: true })}\``);
		message.channel.send(botembed);
	}

};
