const Command = require('../../Structures/Command');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const converter = require('number-to-words-en');

module.exports = class extends Command {

	constructor(...args) {
		super(...args, {
			aliases: ['bal', 'coins', 'money'],
			description: 'Displays balance of message author/tagged user.',
			category: 'Hidden',
			usage: '[@user]'
		});
	}

	async run(message) {
		this.client.getBalance = db.prepare('SELECT * FROM balance WHERE user = ? AND guild = ?');

		const user = message.mentions.users.first() || message.author;
		if (user.bot) return;

		let balance;
		if (message.guild) {
			balance = this.client.getBalance.get(user.id, message.guild.id);
		}

		let phrase;
		if (user.id === message.author.id) {
			phrase = 'You have no balance :(';
		} else {
			phrase = 'This user has no balance :(';
		}
		if (!balance) {
			message.channel.send(phrase);
			return;
		}

		const userRank = db.prepare('SELECT count(*) FROM balance WHERE total >= ? AND guild = ? AND user ORDER BY total DESC').all(balance.total, message.guild.id);

		const rankPos = converter.toOrdinal(`${userRank[0]['count(*)']}`);

		const embed = new MessageEmbed()
			.setAuthor(`${user.username}'s Balance`, user.avatarURL())
			.setDescription(`Leaderboard Rank: \`${rankPos}\``)
			.setColor(message.guild.me.displayHexColor || 'A10000')
			.addFields({ name: 'Cash', value: `<:coin:706659001164628008> ${balance.cash.toLocaleString('en')}`, inline: true },
				{ name: 'Bank', value: `<:coin:706659001164628008> ${balance.bank.toLocaleString('en')}`, inline: true },
				{ name: 'Total', value: `<:coin:706659001164628008> ${balance.total.toLocaleString('en')}`, inline: true })
			.setTimestamp();

		message.channel.send(embed);
	}

};
