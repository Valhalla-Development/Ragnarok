/* eslint-disable prefer-destructuring */
const Command = require('../../Structures/Command');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');
const { URLSearchParams } = require('url');

const API_URL = 'https://djsdocs.sorta.moe/v2/embed';

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays search results in the D.js documentation.',
			category: 'Fun',
			usage: '<query> [--type stable|master|rpc|commando]'
		});
	}

	async run(message, args) {
		if (!args[0]) {
			this.client.utils.messageDelete(message, 10000);

			const noInput = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Discord.js**`,
					`**◎ Error:** You must input a search term!`);
			message.channel.send(noInput).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (args[0] === 'djs') {
			const noInput = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.setDescription(`**${this.client.user.username} - Discord.js**`)
				.setImage('https://i.imgflip.com/2guzlr.jpg');
			message.channel.send(noInput);
			return;
		}

		const types = ['stable', 'master', 'rpc', 'commando', 'akairo-master'];
		let type;

		if (args[1] === '--type' && types.includes(args[2])) {
			type = args[2];
		} else {
			type = 'stable';
		}

		const qs = new URLSearchParams({
			src: type,
			q: args[0].replace(/#/g, '.'),
			force: 'false'
		});

		const res = await fetch(`${API_URL}?${qs}`).then(r => r.json());
		if (!res) {
			this.client.utils.messageDelete(message, 10000);

			const noInput = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Discord.js**`,
					`**◎ Error:** I couldn't find anything for \`${args[0]}\``);
			message.channel.send(noInput).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const embed = new MessageEmbed(res).setColor(this.client.utils.color(message.guild.me.displayHexColor));

		message.channel.send(embed);
	}

};
