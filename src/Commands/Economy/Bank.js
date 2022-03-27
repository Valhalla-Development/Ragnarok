const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');

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
				.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Bank**`,
					`**◎ Error:** You do not have any cash to deposit!`);
			message.channel.send({ embeds: [limitE] }).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const bankCalc = balance.cash + balance.bank;

		const depAll = new MessageEmbed()
			.setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.setThumbnail('attachment://Bank.png')
			.addField(`**${this.client.user.username} - Bank**`,
				`**◎ Success:** You have deposited <:coin:706659001164628008> \`${balance.cash.toLocaleString('en')}\` to your bank.`);
		message.channel.send({ embeds: [depAll], files: ['./Storage/Images/Economy/Bank.png'] });

		balance.cash = 0;
		balance.bank = bankCalc;
		balance.total = bankCalc;

		this.client.setBalance.run(balance);
		return;
	}

};
