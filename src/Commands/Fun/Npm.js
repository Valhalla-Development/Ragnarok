/* eslint-disable prefer-destructuring */
const Command = require('../../Structures/Command');
const fetch = require('node-fetch-cjs');
const { EmbedBuilder } = require('discord.js');

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

			const noInput = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Discord.js**`,
					value: `**◎ Error:** You must input a search term!` });
			message.channel.send({ embeds: [noInput] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const res = await fetch.default(`https://registry.npmjs.org/${args.join('-')}`).then(r =>
			r.json());

		if (res.error) {
			this.client.utils.messageDelete(message, 10000);

			const noInput = new EmbedBuilder()
				.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
				.addFields({ name: `**${this.client.user.username} - Discord.js**`,
					value: `**◎ Error:** I couldn't find anything for \`${args[0]}\`` });
			message.channel.send({ embeds: [noInput] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const version = res.versions[res['dist-tags'].latest];

		const embed = new EmbedBuilder()
			.setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
			.setThumbnail('https://static.npmjs.com/338e4905a2684ca96e08c7780fc68412.png')
			.setAuthor({ name: `${res.name}`, iconURL: 'https://i.imgur.com/ErKf5Y0.png', url: `https://www.npmjs.com/package/${res._id}` })
			.addFields({ name: 'Package Info\n',
				value: `**❯ Author:** ${version.maintainers[0].name || 'None'}
				**❯ Repository:** ${res.repository ? res.repository.url : 'None'}
				**❯ ${version.maintainers.length > 1 ? 'Maintainers' : 'Maintainer'}:** ${version.maintainers
	.map(usr => usr.name)
	.join(', ')}
				**❯ Latest Version:** ${version.version || 'None'}
				**❯ Keywords:** ${res.keywords ? res.keywords.join(', ') : 'None'}` });

		if (res.description) {
			embed.setDescription('**Description:**', res.description);
		}

		message.channel.send({ embeds: [embed] });
	}

};
