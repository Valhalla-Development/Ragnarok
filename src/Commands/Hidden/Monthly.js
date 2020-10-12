/* eslint-disable no-mixed-operators */
/* eslint-disable no-inline-comments */
const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const bankLimit = Number(500000);
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['month'],
			description: 'Gives a monthly reward.',
			category: 'Hidden'
		});
	}

	async run(message) {
		let balance;
		if (message.guild) {
			balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);
		}

		if (balance.monthly !== null) {
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Monthly**`,
					`**◎ Error:** Please wait another \`${ms(balance.monthly - new Date().getTime(), { long: true })}\` before using this command.`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const monthlyAmount = Math.floor(Math.random() * (1200 - 800 + 1) + 800); // * (max - min + 1) + min);

		if (balance.total + monthlyAmount >= bankLimit) {
			const embed = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Monthly**`,
					`**◎ Error:** This command would exceed your bank limit!`);
			message.channel.send(embed).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const endTime = new Date().getTime() + 2629800000;

		const totaCalc2 = balance.total + monthlyAmount;
		const addAut = {
			id: `${message.author.id}-${message.guild.id}`,
			user: message.author.id,
			guild: message.guild.id,
			hourly: balance.hourly,
			daily: balance.daily,
			weekly: balance.weekly,
			monthly: Math.round(endTime),
			cash: balance.cash,
			bank: balance.bank + monthlyAmount,
			total: totaCalc2
		};

		this.client.setBalance.run(addAut);

		const depArg = new MessageEmbed()
			.setAuthor(`${message.author.username}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addField(`**${this.client.user.username} - Monthly**`,
				`**◎ Success:** You have received your monthly sum of: <:coin:706659001164628008> ${monthlyAmount.toLocaleString('en')}.`);
		message.channel.send(depArg);
	}

};
