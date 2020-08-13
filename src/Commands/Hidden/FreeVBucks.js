const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['vbucks', 'fortnite'],
			description: 'Hidden Easter Egg, shh!',
			category: 'Hidden'
		});
	}

	async run(message) {
		const embed = new MessageEmbed()
			.setColor(message.guild.me.displayHexColor || '36393F')
			.addField('**Free V-Bucks!**',
				`**◎ Free V-Bucks:** React with ✅ for free V-Bucks!`);
		message.channel.send(embed).then(async (a) => {
			a.react('✅');

			const filter = (reaction, user) => ['✅'].includes(reaction.emoji.name) && user.id === message.author.id;

			a.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
				.then(collected => {
					const reaction = collected.first();

					if (reaction.emoji.name === '✅') {
						message.reply('Virus activated!');
						a.delete();
					}
				}).catch(() => {
					a.delete();
				});
		});
	}

};
