/* eslint-disable prefer-destructuring */
const Command = require('../../Structures/Command');
const fetch = require('node-fetch');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays search results for NPM.',
			category: 'Fun',
			usage: '<query>'
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

		const res = await fetch(`https://registry.npmjs.org/${args[0]}`).then(r =>
			r.json());

		if (!res) {
			this.client.utils.messageDelete(message, 10000);

			const noInput = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Discord.js**`,
					`**◎ Error:** I couldn't find anything for \`${args[0]}\``);
			message.channel.send(noInput).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const version = res.versions[res['dist-tags'].latest];

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setThumbnail('https://static.npmjs.com/338e4905a2684ca96e08c7780fc68412.png')
			.setAuthor(res.name, 'https://i.imgur.com/ErKf5Y0.png', `https://www.npmjs.com/package/${res._id}`)
			.addField('Package Info', [
				`**❯ Author:** ${version.maintainers[0].name || 'None'}`,
				`**❯ Repository:** ${res.repository.url || 'None'}`,
				`**❯ ${version.maintainers.length > 1 ? 'Maintainers' : 'Maintainer'}:** ${version.maintainers
					.map(usr => usr.name)
					.join(', ')}`,
				`**❯ Latest Version:** ${version.version || 'None'}`,
				`**❯ Keywords:** ${res.keywords ? res.keywords.join(', ') : 'None'}`
			]);

		if (res.description) {
			embed.setDescription(['**Description:**', res.description]);
		}

		message.channel.send(embed);
	}

};
