/* eslint-disable no-mixed-operators */
/* eslint-disable no-inline-comments */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const bankLimit = Number(500000);
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['hour'],
			description: 'Gives a hourly reward.',
			category: 'Hidden'
		});
	}

	async run(message) {
		let balance;
		if (message.guild) {
			balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);
		}

		if (balance.hourly !== null) {
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Hourly**`,
					`**◎ Error:** Please wait another \`${ms(balance.hourly - new Date().getTime(), { long: true })}\` before using this command.`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const hourlyAmount = Math.floor(Math.random() * (25 - 15 + 1) + 15); // * (max - min + 1) + min);

		if (balance.total + hourlyAmount >= bankLimit) {
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Hourly**`,
					`**◎ Error:** This command would exceed your bank limit!`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const endTime = new Date().getTime() + 3600000;

		const totaCalc2 = balance.total + hourlyAmount;
		const addAut = {
			id: `${message.author.id}-${message.guild.id}`,
			user: message.author.id,
			guild: message.guild.id,
			hourly: Math.round(endTime),
			daily: balance.daily,
			weekly: balance.weekly,
			monthly: balance.monthly,
			cash: balance.cash,
			bank: balance.bank + hourlyAmount,
			total: totaCalc2
		};

		this.client.setBalance.run(addAut);

		const depArg = new MessageEmbed()
			.setAuthor(`${message.author.username}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Hourly**`,
				`**◎ Success:** You have received your hourly sum of: <:coin:706659001164628008> ${hourlyAmount.toLocaleString('en')}.`);
		message.channel.send(depArg);
	}

};
