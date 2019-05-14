const { MessageEmbed } = require('discord.js');

module.exports = {
	config: {
		name: 'coinflip',
		usage: '${prefix}coinflip',
		category: 'fun',
		description: 'Flips a coin',
		accessableby: 'Everyone',
	},
	run: async (bot, message) => {
		const rolled = Math.floor(Math.random() * 2) + 1;
		const headembed = new MessageEmbed()
			.setAuthor('Coin Flip')
			.addField('Result', 'You flipped a: **Heads**!')
			.setColor('0xff1053');
		const tailembed = new MessageEmbed()
			.setAuthor('Coin Flip')
			.addField('Result', 'You flipped a: **Tails**!')
			.setColor('0x00bee8');
		if (rolled == '1') {
			message.channel.send(tailembed);
		}
		if (rolled == '2') {
			message.channel.send(headembed);
		}
	},
};
