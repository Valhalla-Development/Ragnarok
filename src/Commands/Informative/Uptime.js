const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays bot uptime',
			category: 'Informative'
		});
	}

	async run(message) {
		const botembed = new MessageEmbed()
			.setTitle('Uptime')
			.setColor(message.guild.me.displayHexColor || '36393F')
			.setDescription(`My uptime is \`${ms(this.client.uptime, { long: true })}\``);

		message.channel.send(botembed);
	}

};
