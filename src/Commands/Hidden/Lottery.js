const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays eco information',
			category: 'Hidden',
			ownerOnly: true
		});
	}

	async run(message, args) {
		// order here
		/*
        new table for economy for config, where staff can set max lottery users, and the pot limit maybe, but make it not too crazy
        you can buy tickets, buy more tickets, view the pot and user count etc... current percentage of winning? maybe say you have one ticket
        put if you buy 1 more your chance of winning will go up buy x%
        */
		const balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);

		let playerList = JSON.parse(balance.lottery);
		if (!playerList) {
			playerList = [];
		}

		if (!args[0]) {
			return message.channel.send({ content: 'bub put available commands here' });
		}

		if (args[0] === 'buy') {
			if (playerList.includes(message.author.id)) {
				return message.channel.send({ content: 'buy MORE tickets bub' });
			} else {
				return message.channel.send({ content: 'buy tickets bub' });
			}
		}
	}

};
