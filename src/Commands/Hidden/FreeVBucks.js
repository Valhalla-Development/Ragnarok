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
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - VBucks**`,
				`**◎ Free V-Bucks:** React with ✅`);
		message.channel.send(embed).then(async (a) => {
			a.react('✅');

			const filter = (reaction, user) => ['✅'].includes(reaction.emoji.name) && user.id === message.author.id;

			a.awaitReactions(filter, { max: 1, time: 60000, errors: ['time'] })
				.then(collected => {
					const reaction = collected.first();

					if (reaction.emoji.name === '✅') {
						if (message.member.guild.me.hasPermission('MANAGE_MESSAGES')) {
							message.delete();
						}
						message.reply('Virus activated!');
						a.delete();
					}
				}).catch(() => {
					a.delete();
				});
		});
	}

};
