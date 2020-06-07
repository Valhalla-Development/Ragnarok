const Command = require('../../Structures/Command');
const fetch = require('node-fetch');

module.exports = class extends Command {

	async run(message, args) {
		const url = 'https://djsdocs.sorta.moe/v2/embed?src=master&q';

		const query = args[0];
		const response = await fetch(`${url}=${query}`);
		const json = await response.json();
		if (json === null) return message.reply('No results found.');
		return message.channel.send({ embed: json });
	}

};
