/* eslint-disable prefer-destructuring */
/* eslint-disable no-unused-expressions */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const blackjack = require('discord-blackjack');
const comCooldown = new Set();
const comCooldownSeconds = 30;

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['bj'],
			description: 'Play a game of blackjack with the house',
			category: 'Economy',
			usage: '<amount/all>'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);

		if (!balance) {
			this.client.utils.messageDelete(message, 10000);

			const limitE = new MessageEmbed()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - BlackJack**`,
					`**◎ Error:** You do not have any balance!`);
			message.channel.send({ embeds: [limitE] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!args[0]) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - BlackJack**`,
					`**◎ Error:** Please input an amount you wish to bet.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (comCooldown.has(message.author.id)) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Blackjack**`,
					`**◎ Error:** You can only run one instance of this game!.`);
			message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		let betAmt;

		isNaN(args[0]) && args[0] === 'all' ? betAmt = balance.bank : betAmt = args[0];

		if (isNaN(betAmt)) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - BlackJack**`,
					`**◎ Error:** An example of this command is: \`${prefix}blackjack 100\`\nAlternatively, you can run \`${prefix}blackjack all\``);
			message.channel.send({ embeds: [wrongUsage] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (Number(betAmt) < 1) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - BlackJack**`,
					`**◎ Error:** Please enter a value of at least \`1\`. Please try again with a valid amount.`);
			message.channel.send({ embeds: [wrongUsage] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (Number(betAmt) > balance.bank) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - BlackJack**`,
					`**◎ Error:** You do not have enough to bet <:coin:706659001164628008> \`${Number(args[0]).toLocaleString('en')}\`, you have <:coin:706659001164628008> \`${Number(balance.bank).toLocaleString('en')}\` available in your bank.`);
			message.channel.send({ embeds: [wrongUsage] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const houseBet = betAmt;

		const win = new MessageEmbed()
			.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Blackjack**`,
				`**◎** ${message.author} won! <:coin:706659001164628008> \`${Number(houseBet).toLocaleString('en')}\` has been credited to your bank!`);

		const lose = new MessageEmbed()
			.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Blackjack**`,
				`**◎** ${message.author} lost <:coin:706659001164628008> \`${Number(betAmt).toLocaleString('en')}\``);

		const tie = new MessageEmbed()
			.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Blackjack**`,
				`**◎** ${message.author} tied. Your wager has been returned to you.`);

		const dbWin = new MessageEmbed()
			.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Blackjack**`,
				`**◎** ${message.author} tied. Your wager has been returned to you.`);

		const dbLose = new MessageEmbed()
			.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Blackjack**`,
				`**◎** ${message.author} tied. Your wager has been returned to you.`);

		const dbTie = new MessageEmbed()
			.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Blackjack**`,
				`**◎** ${message.author} tied. Your wager has been returned to you.`);

		const cancel = new MessageEmbed()
			.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Blackjack**`,
				`**◎** ${message.author} cancelled the game.`);

		const timeout = new MessageEmbed()
			.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Blackjack**`,
				`**◎** ${message.author} tied. Your wager has been returned to you.`);

		const game = await blackjack(message, { resultEmbed: true });

		if (!comCooldown.has(message.author.id)) {
			comCooldown.add(message.author.id);
		}
		setTimeout(() => {
			if (comCooldown.has(message.author.id)) {
				comCooldown.delete(message.author.id);
			}
		}, comCooldownSeconds * 1000);

		switch (game.result) {
			case 'WIN':
				message.channel.send({ embeds: [win] });
				balance.bank += Number(houseBet);
				balance.total += Number(houseBet);
				this.client.setBalance.run(balance);

				if (comCooldown.has(message.author.id)) {
					comCooldown.delete(message.author.id);
				}
				break;
			case 'LOSE':
				message.channel.send({ embeds: [lose] });
				balance.bank -= Number(betAmt);
				balance.total -= Number(betAmt);
				this.client.setBalance.run(balance);

				if (comCooldown.has(message.author.id)) {
					comCooldown.delete(message.author.id);
				}
				break;

			case 'TIE':
				message.channel.send({ embeds: [tie] });

				if (comCooldown.has(message.author.id)) {
					comCooldown.delete(message.author.id);
				}
				break;
			case 'DOUBLE WIN':
				message.channel.send({ embeds: [dbWin] });

				if (comCooldown.has(message.author.id)) {
					comCooldown.delete(message.author.id);
				}
				break;
			case 'DOUBLE LOSE':
				message.channel.send({ embeds: [dbLose] });

				if (comCooldown.has(message.author.id)) {
					comCooldown.delete(message.author.id);
				}
				break;
			case 'DOUBLE TIE':
				message.channel.send({ embeds: [dbTie] });

				if (comCooldown.has(message.author.id)) {
					comCooldown.delete(message.author.id);
				}
				break;
			case 'CANCEL':
				message.channel.send({ embeds: [cancel] });

				if (comCooldown.has(message.author.id)) {
					comCooldown.delete(message.author.id);
				}
				break;
			case 'TIMEOUT':
				message.channel.send({ embeds: [timeout] });

				if (comCooldown.has(message.author.id)) {
					comCooldown.delete(message.author.id);
				}
				break;
		}
	}

};
