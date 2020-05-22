const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const converter = require('number-to-words-en');

module.exports = {
  config: {
    name: 'balance',
    aliases: ['bal', 'coins'],
    usage: '${prefix}balance',
    category: 'hidden',
    description: 'Displays your balance',
    accessableby: 'Everyone',
  },
  run: async (bot, message) => {
    bot.getBalance = db.prepare(
      'SELECT * FROM balance WHERE user = ? AND guild = ?',
    );

    const user = message.mentions.users.first() || message.author;
    if (user.bot) return;

    let balance;
    if (message.guild) {
      balance = bot.getBalance.get(user.id, message.guild.id);
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
      .setDescription(`Leaderboard Rank: ${rankPos}`)
      .setColor('36393F')
      .addFields({ name: 'Cash', value: `<:coin:706659001164628008> ${balance.cash.toLocaleString('en')}`, inline: true },
        { name: 'Bank', value: `<:coin:706659001164628008> ${balance.bank.toLocaleString('en')}`, inline: true },
        { name: 'Total', value: `<:coin:706659001164628008> ${balance.total.toLocaleString('en')}`, inline: true })
      .setTimestamp();

    message.channel.send(embed);
  },
};
