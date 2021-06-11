const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['upgrade', 'boosts', 'store'],
			description: 'Purchase upgrades',
			category: 'Hidden',
			ownerOnly: true
		});
	}

	async run(message, args) {
		const card = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
		let c1 = card[Math.floor(Math.random() * card.length)];
		let c2 = card[Math.floor(Math.random() * card.length)];
		let cardtotal = c1 + c2;
		if (cardtotal >= 19) {
			c1 = 8;
			c2 = 11;
			cardtotal = 19;
		}
		let nextCard;
		let i = 0;

		i += c1 + c2;
		const embed = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setDescription(`**◎** You drew a \`${c1}\` and \`${c2}\`, your total is: \`${cardtotal}\`.\nHit (:thumbsup:) or Stand (:thumbsdown:)?`);
		message.channel.send({ embed: embed }).then(async (msg) => {
			await msg.react('👍');
			await msg.react('👎');

			const hitReact = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '👍' && user.id === message.author.id, { time: 30000 });
			const stickReact = msg.createReactionCollector((reaction, user) => reaction.emoji.name === '👎' && user.id === message.author.id, { time: 30000 });

			hitReact.on('collect', async (r) => {
				await r.users.remove(message.author);

				nextCard = card[Math.floor(Math.random() * card.length)];

				i += nextCard;

				if (i >= 21) {
					embed.setDescription(`Bust!`);
					hitReact.stop();
				} else {
					embed.setDescription(`You got a \`${nextCard}\`, your new total is \`${nextCard + cardtotal}\``);
				}
				msg.edit(embed);
			});

			stickReact.on('collect', async (r) => {
				await r.users.remove(message.author);
				embed.setDescription(`you stand bub`);
				msg.edit(embed);
			});
		});
	}

};
