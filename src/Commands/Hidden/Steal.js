/* eslint-disable no-mixed-operators */
/* eslint-disable no-inline-comments */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['rob'],
			description: 'Steals money from specified user',
			category: 'Hidden',
			usage: '<@user>'
		});
	}

	async run(message) {
		const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
		const { prefix } = prefixgrab;

		const user = message.mentions.users.first();

		if (!user) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Steal**`,
					`**◎ Error:** An example of this command is: \`${prefix}steal @user\``);
			message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		if (user.bot) return;

		let balance;
		let otherB;
		if (message.guild) {
			balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);
			otherB = this.client.getBalance.get(`${user.id}-${message.guild.id}`);
		}

		if (otherB.cash < 10) {
			this.client.utils.messageDelete(message, 10000);

			const wrongUsage = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Steal**`,
					`**◎ Error:** The targeted user does not have enough cash to steal!`);
			message.channel.send(wrongUsage).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const other25perc = otherB.cash / 4;
		const other10perc = otherB.cash / 20;
		const stealAmount = Math.floor(Math.random() * (other25perc - other10perc + 1) + other10perc); // * (max - min + 1) + min);

		const totalCalc = otherB.total - stealAmount;
		const cashCalc = otherB.cash - stealAmount;
		const setUse = {
			id: `${user.id}-${message.guild.id}`,
			user: user.id,
			guild: message.guild.id,
			hourly: otherB.hourly,
			daily: otherB.daily,
			weekly: otherB.weekly,
			monthly: otherB.monthly,
			cash: cashCalc,
			bank: otherB.bank,
			total: totalCalc
		};

		this.client.setUserBalance.run(setUse);

		const totaCalc2 = balance.total + stealAmount;
		const cashCalc2 = balance.cash + stealAmount;
		const addAut = {
			id: `${message.author.id}-${message.guild.id}`,
			user: message.author.id,
			guild: message.guild.id,
			hourly: balance.hourly,
			daily: balance.daily,
			weekly: balance.weekly,
			monthly: balance.monthly,
			cash: cashCalc2,
			bank: balance.bank,
			total: totaCalc2
		};

		this.client.setBalance.run(addAut);

		const depArg = new MessageEmbed()
			.setAuthor(`${message.author.username}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Steal**`,
				`**◎ Success:** You have robbed ${user} to the value of: <:coin:706659001164628008> ${stealAmount.toLocaleString('en')}.`);
		message.channel.send(depArg);
	}

};
