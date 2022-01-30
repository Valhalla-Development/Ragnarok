const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch-cjs');
const trim = (str, max) => str.length > max ? `${str.slice(0, max - 3)}...` : str;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Fetches Urban Dictionary definition',
			category: 'Fun',
			usage: '<text>'
		});
	}

	async run(message, args) {
		this.client.utils.messageDelete(message, 10000);

		if (!message.channel.nsfw) {
			const nsfw = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Urban**`,
					`**◎ Error:** You must be in a \`NSFW\` channel!`);
			message.channel.send({ embeds: [nsfw] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (args[0] === undefined) {
			const wronguUsage = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Urban**`,
					`**◎ Error:** You must supply a search term.`);
			message.channel.send({ embeds: [wronguUsage] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const msg = await message.channel.send({ content: 'Generating...' });
		message.channel.sendTyping();

		const query = args.slice(0).join('+');
		const body = await fetch.default(`http://api.urbandictionary.com/v0/define?term=${query}`).then((response) => response.json());

		if (body.list.length < 1) {
			this.client.utils.messageDelete(msg, 0);

			const noResult = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Urban**`,
					`**◎ Error:** I found no results for: \`${args.join(' ')}\``);
			message.channel.send({ embeds: [noResult] }).then((m) => this.client.utils.deletableCheck(m, 10000));

			return;
		}

		const [answer] = body.list;

		const embed = new MessageEmbed()
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setFooter({ text: 'Urban Dictionary', iconURL: 'https://i.lensdump.com/i/88BhFP.png' })
			.setTimestamp()
			.setTitle(answer.word)
			.setURL(answer.permalink)
			.addFields({ name: 'Definition', value: trim(answer.definition, 1024) },
				{ name: 'Example', value: trim(answer.example, 1024) },
				{ name: 'Rating', value: `${answer.thumbs_up} 👍 ${answer.thumbs_down} 👎` });

		message.channel.send({ embeds: [embed] });

		this.client.utils.messageDelete(msg, 0);
	}

};
