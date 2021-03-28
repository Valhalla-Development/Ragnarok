const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['pay'],
			description: 'Gives money to specified user from your bank.',
			category: 'Economy',
			usage: '<@user> <amount/all>'
		});
	}

	async run(message, args) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const user = message.mentions.users.first();

		if (!user) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Give**`,
					`**◎ Error:** An example of this command is: \`${prefix}give @user 100\`\nAlternatively, you can run \`${prefix}give @user all\``);
			message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		let balance;
		let otherB;
		if (message.guild) {
			balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);
			otherB = this.client.getBalance.get(`${user.id}-${message.guild.id}`);
		}

		if (args[1] === '-a') {
			if (this.client.utils.checkOwner(message.author.id)) {
				const update = db.prepare('UPDATE balance SET bank = (@bank), total = (@total) WHERE id = (@id);');
				await update.run({
					bank: otherB.bank + Number(args[2]),
					total: otherB.total + Number(args[2]),
					id: `${user.id}-${message.guild.id}`
				});

				const amt = otherB.total + Number(args[2]);
				const embed = new MessageEmbed()
					.setAuthor(`${message.author.tag}`, message.author.avatarURL())
					.setColor(this.client.utils.color(message.guild.me.displayHexColor))
					.addField(`**${this.client.user.username} - Give - Admin**`,
						`**◎ Success:** System gave <:coin:706659001164628008> \`${Number(args[2]).toLocaleString('en')}\` to ${user}\nNew total: <:coin:706659001164628008> \`${amt.toLocaleString('en')}\``);
				message.channel.send(embed);
				return;
			}
		}

		if (user.id === message.author.id) {
			this.client.utils.messageDelete(message, 10000);

			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Give**`,
					`**◎ Error:** You can not give yourself money. <:wut:745408596233289839>`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (user.bot) return;

		if (!otherB) {
			this.client.utils.messageDelete(message, 10000);

			const errorE = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Give**`,
					`**◎ Error:** ${user} does not have an economy account. They will instantly open one when they speak.`);
			message.channel.send(errorE).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}


		if (balance.bank === 0) {
			this.client.utils.messageDelete(message, 10000);

			const noBal = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Give**`,
					`**◎ Error:** Uh oh! You currently have no money in your bank!`);
			message.channel.send(noBal).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (args[1] === 'all') {
			this.client.utils.messageDelete(message, 10000);

			const totaCalc1 = otherB.total + balance.bank;
			const setUse = {
				id: `${user.id}-${message.guild.id}`,
				user: user.id,
				guild: message.guild.id,
				hourly: otherB.hourly,
				daily: otherB.daily,
				weekly: otherB.weekly,
				monthly: otherB.monthly,
				stealcool: otherB.stealcool,
				boosts: otherB.boosts,
				cash: otherB.cash,
				bank: balance.bank + otherB.bank,
				total: totaCalc1,
				fishcool: otherB.fishcool,
				farmcool: otherB.farmcool,
				items: otherB.items,
				claimNewUser: otherB.claimNewUser
			};

			this.client.setUserBalance.run(setUse);

			const totaCalc2 = balance.total - balance.bank;
			const addAut = {
				id: `${message.author.id}-${message.guild.id}`,
				user: message.author.id,
				guild: message.guild.id,
				hourly: balance.hourly,
				daily: balance.daily,
				weekly: balance.weekly,
				monthly: balance.monthly,
				stealcool: balance.stealcool,
				boosts: balance.boosts,
				cash: balance.cash,
				bank: 0,
				total: totaCalc2,
				fishcool: balance.fishcool,
				farmcool: balance.farmcool,
				items: balance.items,
				claimNewUser: balance.claimNewUser
			};

			this.client.setBalance.run(addAut);

			const depAll = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Give**`,
					`**◎ Success:** You have paid ${user} the sum of: <:coin:706659001164628008> \`${balance.bank.toLocaleString('en')}\`.`);
			message.channel.send(depAll);
			return;
		}

		if (isNaN(args[1]) || args.length > 2) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Give**`,
					`**◎ Error:** An example of this command is: \`${prefix}give @user 100\`\nAlternatively, you can run \`${prefix}give @user all\``);
			message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (Number(args[1]) < 1) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Give**`,
					`**◎ Error:** Please enter a value of at least \`1\`. Please try again with a valid amount.`);
			message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (args[1] > balance.bank) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Give**`,
					`**◎ Error:** You only have <:coin:706659001164628008> \`${balance.bank.toLocaleString('en')}\`. Please try again with a valid amount.`);
			message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const numberCov = Number(args[1]);

		const totaCalc1 = otherB.total + numberCov;
		const setUse = {
			id: `${user.id}-${message.guild.id}`,
			user: user.id,
			guild: message.guild.id,
			hourly: otherB.hourly,
			daily: otherB.daily,
			weekly: otherB.weekly,
			monthly: otherB.monthly,
			stealcool: otherB.stealcool,
			boosts: otherB.boosts,
			cash: otherB.cash,
			bank: numberCov + otherB.bank,
			total: totaCalc1,
			fishcool: otherB.fishcool,
			farmcool: otherB.farmcool,
			items: otherB.items,
			claimNewUser: otherB.claimNewUser
		};

		this.client.setUserBalance.run(setUse);

		const totaCalc2 = balance.total - numberCov;
		const addAut = {
			id: `${message.author.id}-${message.guild.id}`,
			user: message.author.id,
			guild: message.guild.id,
			hourly: balance.hourly,
			daily: balance.daily,
			weekly: balance.weekly,
			monthly: balance.monthly,
			stealcool: balance.stealcool,
			boosts: balance.boosts,
			cash: balance.cash,
			bank: balance.bank - numberCov,
			total: totaCalc2,
			fishcool: balance.fishcool,
			farmcool: balance.farmcool,
			items: balance.items,
			claimNewUser: balance.claimNewUser
		};

		this.client.setBalance.run(addAut);

		const depArg = new MessageEmbed()
			.setAuthor(`${message.author.username}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Give**`,
				`**◎ Success:** You have paid ${user} the sum of: <:coin:706659001164628008> \`${numberCov.toLocaleString('en')}\`.`);
		message.channel.send(depArg);
	}

};
