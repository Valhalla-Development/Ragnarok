const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			description: 'Withdraws specified amount from your bank.',
			category: 'Economy',
			usage: '<amount/all>'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);

		const numberCov = Number(args[0]);

		if (balance.bank === 0) {
			this.client.utils.messageDelete(message, 10000);

			const noBalance = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Withdraw**`,
					`**◎ Error:** You currently have no money in your bank!`);
			message.channel.send(noBalance).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (args[0] === 'all') {
			const bankCalc = balance.cash + balance.bank;
			const addAll = {
				id: `${message.author.id}-${message.guild.id}`,
				user: message.author.id,
				guild: message.guild.id,
				hourly: balance.hourly,
				daily: balance.daily,
				weekly: balance.weeky,
				monthly: balance.monthly,
				yearly: balance.yearly,
				stealcool: balance.stealcool,
				boosts: balance.boosts,
				cash: bankCalc,
				bank: 0,
				total: bankCalc,
				fishcool: balance.fishcool,
				farmcool: balance.farmcool,
				items: balance.items,
				claimNewUser: balance.claimNewUser
			};

			this.client.setBalance.run(addAll);
			const depAll = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Withdraw**`,
					`**◎ Success:** You have withdrawn <:coin:706659001164628008> \`${balance.bank.toLocaleString('en')}\`.`);
			message.channel.send(depAll);
			return;
		}

		if (isNaN(args[0]) || args.length > 1) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Withdraw**`,
					`**◎ Error:** An example of this command is: \`${prefix}withdraw 100\`\nAlternatively, you can run \`${prefix}withdraw all\``);
			message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (args[0] > balance.bank) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Withdraw**`,
					`**◎ Error:** You only have <:coin:706659001164628008> \`${balance.bank.toLocaleString('en')}\`. Please try again with a valid amount.`);
			message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const cashA = balance.cash + numberCov;
		const bankA = balance.bank - numberCov;
		const totaA = balance.total;

		const addAll = {
			id: `${message.author.id}-${message.guild.id}`,
			user: message.author.id,
			guild: message.guild.id,
			hourly: balance.hourly,
			daily: balance.daily,
			weekly: balance.weeky,
			monthly: balance.monthly,
			yearly: balance.yearly,
			stealcool: balance.stealcool,
			boosts: balance.boosts,
			cash: cashA,
			bank: bankA,
			total: totaA,
			fishcool: balance.fishcool,
			farmcool: balance.farmcool,
			items: balance.items,
			claimNewUser: balance.claimNewUser
		};

		this.client.setBalance.run(addAll);

		const depAll = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Withdraw**`,
				`**◎ Success:** You have withdrawn <:coin:706659001164628008> \`${numberCov.toLocaleString('en')}\`.`);
		message.channel.send(depAll);
	}

};
