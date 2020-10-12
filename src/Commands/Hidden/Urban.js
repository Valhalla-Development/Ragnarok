const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');
const trim = (str, max) => str.length > max ? `${str.slice(0, max - 3)}...` : str;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Fetches Urban Dictionary definition',
			category: 'Hidden',
			usage: '<text>'
		});
	}

	async run(message, args) {
		if (!message.channel.nsfw) {
			const nsfw = new MessageEmbed()
				.setColor('36393F')
				.setDescription(':x: | You must be in a NSFW channel!');
			message.channel.send(nsfw).then((m) => m.delete({ timeout: 5000 }));
			return;
		}
		if (args[0] === undefined) {
			const undembed = new MessageEmbed()
				.setColor('36393F')
				.setDescription(':x: | You must supply a search term!');
			message.channel.send(undembed).then((m) => m.delete({ timeout: 5000 }));
			return;
		}
		const msg = await message.channel.send('Generating...');
		message.channel.startTyping();

		const query = args.slice(0).join('+');
		const body = await fetch(
			`http://api.urbandictionary.com/v0/define?term=${query}`
		).then((response) => response.json());

		if (body.list.length < 1) {
			message.channel.send(`No results found for **${args.join(' ')}**.`).then((m) => m.delete({ timeout: 5000 }));
			message.channel.stopTyping();
			msg.delete();
			return;
		}

		const [answer] = body.list;

		const embed = new MessageEmbed()
			.setColor('36393F')
			.setFooter('Urban Dictionary', 'https://i.lensdump.com/i/88BhFP.png')
			.setTimestamp()
			.setTitle(answer.word)
			.setURL(answer.permalink)
			.addFields({ name: 'Definition', value: trim(answer.definition, 1024) },
				{ name: 'Example', value: trim(answer.example, 1024) },
				{ name: 'Rating', value: `${answer.thumbs_up} thumbs up. ${answer.thumbs_down} thumbs down,` });

		message.channel.send(embed);

		message.channel.stopTyping();
		msg.delete();
	}

};
