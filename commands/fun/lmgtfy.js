const encode = require('strict-uri-encode');

module.exports = {
	config: {
		name: 'lmgtfy',
		usage: '${prefix}lmgtfy <question>',
		category: 'fun',
		description: 'Posts a \'Let me Google that for you\' link',
		accessableby: 'Everyone',
	},
	run: async (bot, message, args) => {
		message.delete();
		const question = encode(args.join(' '));
		const link = `https://www.lmgtfy.com/?q=${question}`;

		message.channel.send(`**<${link}>**`);
	},
};
