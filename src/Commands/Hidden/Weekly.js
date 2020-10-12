/* eslint-disable no-mixed-operators */
/* eslint-disable no-inline-comments */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const bankLimit = Number(500000);
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['week'],
			description: 'Gives a weekly reward.',
			category: 'Hidden'
		});
	}

	async run(message) {
		let balance;
		if (message.guild) {
			balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);
		}

		if (balance.weekly !== null) {
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Weekly**`,
					`**◎ Error:** Please wait another \`${ms(balance.weekly - new Date().getTime(), { long: true })}\` before using this command.`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const weeklyAmount = Math.floor(Math.random() * (600 - 400 + 1) + 400); // * (max - min + 1) + min);

		if (balance.total + weeklyAmount >= bankLimit) {
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Weekly**`,
					`**◎ Error:** This command would exceed your bank limit!`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const endTime = new Date().getTime() + 604800000;

		const totaCalc2 = balance.total + weeklyAmount;
		const addAut = {
			id: `${message.author.id}-${message.guild.id}`,
			user: message.author.id,
			guild: message.guild.id,
			hourly: balance.hourly,
			daily: balance.daily,
			weekly: Math.round(endTime),
			monthly: balance.monthly,
			cash: balance.cash,
			bank: balance.bank + weeklyAmount,
			total: totaCalc2
		};

		this.client.setBalance.run(addAut);

		const depArg = new MessageEmbed()
			.setAuthor(`${message.author.username}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Weeky**`,
				`**◎ Success:** You have received your weekly sum of: <:coin:706659001164628008> ${weeklyAmount.toLocaleString('en')}.`);
		message.channel.send(depArg);
	}

};
