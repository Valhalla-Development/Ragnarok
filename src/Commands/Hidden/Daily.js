/* eslint-disable no-mixed-operators */
/* eslint-disable no-inline-comments */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const bankLimit = Number(500000);
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['day'],
			description: 'Gives a daily reward.',
			category: 'Hidden'
		});
	}

	async run(message) {
		let balance;
		if (message.guild) {
			balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);
		}

		if (balance.daily !== null) {
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Daily**`,
					`**◎ Error:** Please wait another \`${ms(balance.daily - new Date().getTime(), { long: true })}\` before using this command.`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const dailyAmount = Math.floor(Math.random() * (150 - 50 + 1) + 50); // * (max - min + 1) + min);

		if (balance.total + dailyAmount >= bankLimit) {
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Daily**`,
					`**◎ Error:** This command would exceed your bank limit!`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const endTime = new Date().getTime() + 86400000;

		const totaCalc2 = balance.total + dailyAmount;
		const addAut = {
			id: `${message.author.id}-${message.guild.id}`,
			user: message.author.id,
			guild: message.guild.id,
			hourly: balance.hourly,
			daily: Math.round(endTime),
			weekly: balance.weekly,
			monthly: balance.monthly,
			cash: balance.cash,
			bank: balance.bank + dailyAmount,
			total: totaCalc2
		};

		this.client.setBalance.run(addAut);

		const depArg = new MessageEmbed()
			.setAuthor(`${message.author.username}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Daily**`,
				`**◎ Success:** You have received your daily sum of: <:coin:706659001164628008> ${dailyAmount.toLocaleString('en')}.`);
		message.channel.send(depArg);
	}

};
