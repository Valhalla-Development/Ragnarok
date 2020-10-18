const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const converter = require('number-to-words-en');
const ms = require('ms');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['bal', 'coins', 'money'],
			description: 'Displays balance of message author/tagged user.',
			category: 'Economy',
			usage: '[@user]'
		});
	}

	async run(message) {
		const user = message.mentions.users.first() || message.author;
		if (user.bot) return;

		const balance = this.client.getBalance.get(`${user.id}-${message.guild.id}`);

		if (!balance) {
			this.client.utils.messageDelete(message, 10000);

			const limitE = new MessageEmbed()
				.setAuthor(`${message.author.tag}`, message.author.avatarURL())
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addField(`**${this.client.user.username} - Balance**`,
					`**◎ Error:** ${user} does not have any balance!`);
			message.channel.send(limitE).then((m) => this.client.utils.deletableCheck(m, 10000));
			return;
		}

		const userRank = db.prepare('SELECT count(*) FROM balance WHERE total >= ? AND guild = ? AND user ORDER BY total DESC').all(balance.total, message.guild.id);

		const rankPos = converter.toOrdinal(`${userRank[0]['count(*)']}`);

		if (user.id === message.author.id) {
			const embed1 = new MessageEmbed()
				.setAuthor(`${user.username}'s Balance`, user.avatarURL())
				.setDescription(`Leaderboard Rank: \`${rankPos}\``)
				.setColor(this.client.utils.color(message.guild.me.displayHexColor))
				.addFields({ name: 'Cash', value: `<:coin:706659001164628008> ${balance.cash.toLocaleString('en')}`, inline: true },
					{ name: 'Bank', value: `<:coin:706659001164628008> ${balance.bank.toLocaleString('en')}`, inline: true },
					{ name: 'Total', value: `<:coin:706659001164628008> ${balance.total.toLocaleString('en')}`, inline: true },
					{ name: 'Steal Cooldown', value: `\`${balance.stealcool ? ms(balance.stealcool - new Date().getTime(), { long: true }) : 'Available'}\`` })
				.setTimestamp();
			message.channel.send(embed1);
			return;
		}
		const embed1 = new MessageEmbed()
			.setAuthor(`${user.username}'s Balance`, user.avatarURL())
			.setDescription(`Leaderboard Rank: \`${rankPos}\``)
			.setColor(this.client.utils.color(message.guild.me.displayHexColor))
			.addFields({ name: 'Cash', value: `<:coin:706659001164628008> ${balance.cash.toLocaleString('en')}`, inline: true },
				{ name: 'Bank', value: `<:coin:706659001164628008> ${balance.bank.toLocaleString('en')}`, inline: true },
				{ name: 'Total', value: `<:coin:706659001164628008> ${balance.total.toLocaleString('en')}`, inline: true })
			.setTimestamp();
		message.channel.send(embed1);
	}

};
