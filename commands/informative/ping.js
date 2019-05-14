module.exports = {
	config: {
		name: 'ping',
		usage: '${prefix}ping',
		category: 'informative',
		description: 'Displays bot latency',
		accessableby: 'Everyone',
	},
	run: async (bot, message) => {
		message.delete();

		const language = require('../../storage/messages.json');

		const pingMessage = language.ping.ping;
		const ping = pingMessage.replace('${ping}', Math.round(bot.ws.ping));

		message.channel.send(`${ping}`);
	},
};
