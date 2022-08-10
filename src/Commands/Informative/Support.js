const Command = require('../../Structures/Command');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Displays an invite link to the bots support server.',
			category: 'Informative',
			botPerms: ['EmbedLinks']
		});
	}

	async run(message) {
		message.channel.send({ content: '**◎ Support Server Invite**: https://discord.gg/Q3ZhdRJ' });
	}

};
