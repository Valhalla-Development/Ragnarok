const Command = require('../../Structures/Command');
const { MessageEmbed, MessageAttachment } = require('discord.js');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['dep', 'deposit'],
			description: 'Banks specified amount of money.',
			category: 'Economy',
			usage: '<amount/all>'
		});
	}

	async run(message) {
		const balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);

		if (balance.cash === 0) {
			this.client.utils.messageDelete(message, 10000);

			const limitE = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Bank**`,
					`**◎ Error:** You do not have any cash to deposit!`);
			message.channel.send(limitE).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const bankCalc = balance.cash + balance.bank;
		const addAll = {
			id: `${message.author.id}-${message.guild.id}`,
			user: message.author.id,
			guild: message.guild.id,
			hourly: balance.hourly,
			daily: balance.daily,
			weekly: balance.weekly,
			monthly: balance.monthly,
			yearly: balance.yearly,
			stealcool: balance.stealcool,
			boosts: balance.boosts,
			cash: 0,
			bank: bankCalc,
			total: bankCalc,
			fishcool: balance.fishcool,
			farmcool: balance.farmcool,
			items: balance.items,
			claimNewUser: balance.claimNewUser
		};

		this.client.setBalance.run(addAll);

		const bankImage = new MessageAttachment('./Storage/Images/Economy/Bank.png', 'Bank.png');

		const depAll = new MessageEmbed()
			.setAuthor(`${message.author.tag}`, message.author.avatarURL())
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.attachFiles(bankImage)
			.setThumbnail('attachment://Bank.png')
			.addField(`**${this.client.user.username} - Bank**`,
				`**◎ Success:** You have deposited <:coin:706659001164628008> \`${balance.cash.toLocaleString('en')}\` to your bank.`);
		message.channel.send(depAll);
		return;
	}

};
