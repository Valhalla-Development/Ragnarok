const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const bankLimit = Number(500000);

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['dep', 'deposit'],
			description: 'Banks specified amount of money.',
			category: 'Hidden',
			usage: '<amount/all>'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		this.client.getBalance = db.prepare(
			'SELECT * FROM balance WHERE user = ? AND guild = ?'
		);

		this.client.setBalance = db.prepare(
			'INSERT OR REPLACE INTO balance (user, guild, cash, bank, total) VALUES (@user, @guild, @cash, @bank, @total);'
		);

		let balance;
		if (message.guild) {
			balance = this.client.getBalance.get(message.author.id, message.guild.id);
		}

		const noBal = 'You have no balance';
		if (!balance) {
			message.channel.send(noBal);
			return;
		}

		const numberCov = Number(args[0]);
		const remainDepA = bankLimit - balance.bank;

		if (args[0] === 'all') {
			if (balance.cash + balance.bank > bankLimit) {
				const limitE = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Bank**`,
						`**◎ Error:** Uh oh! There is a bank limit of <:coin:706659001164628008> ${bankLimit.toLocaleString('en')}.\n Your current bank balance is <:coin:706659001164628008> ${balance.bank.toLocaleString('en')}.\nYou may deposit <:coin:706659001164628008> ${remainDepA.toLocaleString('en')} more.`);
				message.channel.send(limitE).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			const bankCalc = balance.cash + balance.bank;
			const addAll = {
				user: message.author.id,
				guild: message.guild.id,
				cash: 0,
				bank: bankCalc,
				total: bankCalc
			};

			this.client.setBalance.run(addAll);
			const depAll = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Bank**`,
					`**◎ Success:** You have deposited <:coin:706659001164628008> ${balance.cash.toLocaleString('en')} to your bank.`);
			message.channel.send(depAll);
			return;
		}

		if (isNaN(args[0]) || args.length > 1) {
			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Bank**`,
					`**◎ Error:** An example of this command is: \`${prefix}bank 100\`\nAlternatively, you can run \`${prefix}bank all\``);
			message.channel.send(wrongUsage).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		if (args[0] > balance.cash) {
			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Bank**`,
					`**◎ Error:** Uh oh! You only have <:coin:706659001164628008> ${balance.cash.toLocaleString('en')}. Please try again with a valid amount.`);
			message.channel.send(wrongUsage).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		if (numberCov + balance.bank > bankLimit) {
			const limitE = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Bank**`,
					`**◎ Error:** Uh oh! There is a bank limit of <:coin:706659001164628008> ${bankLimit.toLocaleString('en')}.\n Your current bank balance is <:coin:706659001164628008> ${balance.bank.toLocaleString('en')}.\nYou may deposit <:coin:706659001164628008> ${remainDepA.toLocaleString('en')} more.`);
			message.channel.send(limitE).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		const cashA = balance.cash - numberCov;
		const bankA = balance.bank + numberCov;
		const totaA = balance.total;

		const addAll = {
			user: message.author.id,
			guild: message.guild.id,
			cash: cashA,
			bank: bankA,
			total: totaA
		};

		this.client.setBalance.run(addAll);

		const depAll = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Bank**`,
				`**◎ Success:** Success!\n You have deposited <:coin:706659001164628008> ${numberCov.toLocaleString('en')} to your bank.`);
		message.channel.send(depAll);
	}

};
