const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const bankLimit = Number(500000);

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['pay'],
			description: 'Gives money to specified user from your bank.',
			category: 'Hidden',
			usage: 'Give <@tag> <amount/all>'
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
		this.client.setUserBalance = db.prepare(
			'INSERT OR REPLACE INTO balance (user, guild, cash, bank, total) VALUES (@user, @guild, @cash, @bank, @total);'
		);

		const user = message.mentions.users.first();

		if (!user) {
			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Incorrect Usage**',
					`**◎ Error** An example of this command is: \`${prefix}give @user 100\`\nAlternatively, you can run \`${prefix}give @user all\``);
			message.channel.send(wrongUsage).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		if (user.bot) return;

		let balance;
		let otherB;
		if (message.guild) {
			balance = this.client.getBalance.get(message.author.id, message.guild.id);
			otherB = this.client.getBalance.get(user.id, message.guild.id);
		}

		if (!balance) {
			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Invalid Balance**',
					`**◎ Error** You have no balance!`);
			message.channel.send(wrongUsage).then((m) => m.delete({ timeout: 15000 }));
			return;
		}
		if (!otherB) {
			const noBalSet = {
				user: user.id,
				guild: message.guild.id,
				cash: 0,
				bank: 1000,
				total: 1000
			};
			this.client.setUserBalance.run(noBalSet);
			const errorE = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Invalid Balance**',
					`**◎ Error** An error occurred, please try again.`);
			message.channel.send(errorE).then((m) => m.delete({ timeout: 15000 }));
			return;
		}


		if (balance.bank === 0) {
			const noBal = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Invalid Balance**',
					`**◎ Error** Uh oh! You currently have no money in your bank!`);
			message.channel.send(noBal).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		if (args[1] === 'all') {
			if (otherB.bank + balance.bank > bankLimit) {
				const youViolatedTheLaw = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(message.guild.me.displayHexColor || '36393F')
					.addField('**Invalid Balance**',
						`**◎ Error** Transferring your entire bank would exceed the target users bank limit! They have <:coin:706659001164628008> \`${bankLimit - otherB.balance}\` available space!`);
				message.channel.send(youViolatedTheLaw).then((m) => m.delete({ timeout: 15000 }));
				return;
			}

			const totaCalc1 = otherB.total + balance.bank;
			const setUse = {
				user: user.id,
				guild: message.guild.id,
				cash: otherB.cash,
				bank: balance.bank + otherB.bank,
				total: totaCalc1
			};

			this.client.setUserBalance.run(setUse);

			const totaCalc2 = balance.total - balance.bank;
			const addAut = {
				user: message.author.id,
				guild: message.guild.id,
				cash: balance.cash,
				bank: 0,
				total: totaCalc2
			};

			this.client.setBalance.run(addAut);

			const depAll = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(message.guild.me.displayHexColor || '36393F')
				.addField('**Success**',
					`**◎ Success** You have paid ${user} the sum of: <:coin:706659001164628008> ${balance.bank.toLocaleString('en')}.`);
			message.channel.send(depAll).then((m) => m.delete({ timeout: 15000 }));
			return;
		}

		if (isNaN(args[1]) || args.length > 2) {
			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(message.guild.me.displayHexColor || '36393F')
				.setDescription(`:x: Incorrect usage! An example of this command is: \`${prefix}give @user 100\`\nAlternatively, you can run \`${prefix}give @user all\``);
			message.channel.send(wrongUsage);
			return;
		}

		if (args[1] > balance.bank) {
			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(message.guild.me.displayHexColor || '36393F')
				.setDescription(`:x: Uh oh! You only have <:coin:706659001164628008> ${balance.bank.toLocaleString('en')}. Please try again with a valid amount.`);
			message.channel.send(wrongUsage);
			return;
		}

		const numberCov = Number(args[1]);

		const totaCalc1 = otherB.total + numberCov;
		const setUse = {
			user: user.id,
			guild: message.guild.id,
			cash: otherB.cash,
			bank: numberCov + otherB.bank,
			total: totaCalc1
		};

		this.client.setUserBalance.run(setUse);

		const totaCalc2 = balance.total - balance.bank;
		const addAut = {
			user: message.author.id,
			guild: message.guild.id,
			cash: balance.cash,
			bank: balance.bank - numberCov,
			total: totaCalc2
		};

		this.client.setBalance.run(addAut);

		const depArg = new MessageEmbed()
			.setAuthor(`${message.author.username}`, message.author.avatarURL())
			.setColor(message.guild.me.displayHexColor || '36393F')
			.setDescription(`:white_check_mark: Success!\n You have paid ${user} the sum of: <:coin:706659001164628008> ${numberCov.toLocaleString('en')}.`);
		message.channel.send(depArg);
	}

};
