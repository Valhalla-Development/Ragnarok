const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const ms = require('ms');

module.exports = class extends Command {

	async run(message) {
		const botembed = new MessageEmbed()
			.setTitle('Uptime')
			.setColor('36393F')
			.setDescription(`My uptime is \`${ms(this.client.uptime, { long: true })}\``);

		message.channel.send(botembed);
	}

};
