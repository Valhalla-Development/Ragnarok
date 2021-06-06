const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const comCooldown = new Set();
const comCooldownSeconds = 10;
const { TicTacToe } = require('weky');
const { MessageButton, MessageActionRow } = require('discord-buttons');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['ttt'],
			description: 'Plays a game of Tic Tac Toe with a user!',
			category: 'Economy'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);

		if (!balance) {
			this.client.utils.messageDelete(message, 10000);

			const limitE = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Tic-Tac-Toe**`,
					`**◎ Error:** You do not have any balance!`);
			message.channel.send(limitE).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (comCooldown.has(message.author.id)) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Tic-Tac-Toe**`,
					`**◎ Error:** You can only run one instance of this game!.`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const user = message.mentions.users.first();

		if (!user) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Tic-Tac-Toe**`,
					`**◎ Error:** An example of this command is: \`${prefix}ttt @user 100\``);
			message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (user.id === message.author.id) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Tic-Tac-Toe**`,
					`**◎ Error:** You can't challenge yourself!`);
			message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const otherB = this.client.getBalance.get(`${user.id}-${message.guild.id}`);

		if (!otherB) {
			this.client.utils.messageDelete(message, 10000);

			const limitE = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Tic-Tac-Toe**`,
					`**◎ Error:** ${user} does not have any balance!`);
			message.channel.send(limitE).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (!args[1]) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Tic-Tac-Toe**`,
					`**◎ Error:** Please input an amount you wish to bet.`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (isNaN(args[1])) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Tic-Tac-Toe**`,
					`**◎ Error:** An example of this command is: \`${prefix}coinflip 100\`\nAlternatively, you can run \`${prefix}coinflip all\``);
			message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (Number(args[1]) < 10) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Tic-Tac-Toe**`,
					`**◎ Error:** Please enter a value of at least <:coin:706659001164628008> \`10\`. Please try again with a valid amount.`);
			message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (Number(args[1]) > balance.bank) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Tic-Tac-Toe**`,
					`**◎ Error:** You do not have enough to bet <:coin:706659001164628008> \`${Number(args[1]).toLocaleString('en')}\`, you have <:coin:706659001164628008> \`${Number(balance.bank).toLocaleString('en')}\` available in your bank.`);
			message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}
		if (Number(args[1]) > otherB.bank) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Tic-Tac-Toe**`,
					`**◎ Error:** ${user} does not have enough to bet <:coin:706659001164628008> \`${Number(args[1]).toLocaleString('en')}\`, they have <:coin:706659001164628008> \`${Number(otherB.bank).toLocaleString('en')}\` available.`);
			message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const buttonA = new MessageButton()
			.setStyle('green')
			.setLabel('Yes!')
			.setID('yes');

		const buttonB = new MessageButton()
			.setStyle('red')
			.setLabel('No!')
			.setID('no');

		const row = new MessageActionRow()
			.addComponent(buttonA)
			.addComponent(buttonB);

		const embed = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Tic-Tac-Toe**`,
				`**◎** ${message.author} has challenged you to a game of Tic Tac Toe!\nThey have put a wager of <:coin:706659001164628008> \`${Number(args[1]).toLocaleString('en')}\`\nWill you accept?`);

		const m = await message.channel.send(`${user}`, { component: row, embed: embed });
		const filter = (but) => but.clicker.user.id === user.id;

		const collector = m.createButtonCollector(filter, { time: 10000 });

		if (!comCooldown.has(message.author.id)) {
			comCooldown.add(message.author.id);
		}
		setTimeout(() => {
			if (comCooldown.has(message.author.id)) {
				comCooldown.delete(message.author.id);
			}
		}, comCooldownSeconds * 1000);

		collector.on('collect', b => {
			if (b.id === 'yes') {
				collector.stop('yes');

				const game = new TicTacToe({
					message: message,
					opponent: user,
					xColor: 'red',
					oColor: 'blurple',
					xEmoji: '❌',
					oEmoji: '0️⃣'
				});
				game.start();// get the winner, then award the winner with the money, draw do nothing with the money just return to player
				return;
			}
			if (b.id === 'no') {
				collector.stop('no');
			}
		});
		collector.on('end', (_, reason) => {
			if (comCooldown.has(message.author.id)) {
				comCooldown.delete(message.author.id);
			}

			if (reason === 'yes') {
				this.client.utils.messageDelete(m, 0);
			}

			if (reason === 'no' || reason === 'time') {
				this.client.utils.messageDelete(message, 0);
				this.client.utils.messageDelete(m, 0);

				const limitE = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Tic-Tac-Toe**`,
						`**◎ Success:** Wager rejected.`);
				message.channel.send(limitE).then((ca) => this.client.utils.deletableCheck(ca, 10000));
				return;
			}
		});
	}

};
