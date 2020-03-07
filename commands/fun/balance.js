const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
  config: {
    name: 'balance',
    aliases: ['bal', 'coins'],
    usage: '${prefix}balance',
    category: 'fun',
    description: 'Displays your balance',
    accessableby: 'Everyone',
  },
  run: async (bot, message, args, color) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    bot.getBalance = db.prepare(
      'SELECT * FROM balance WHERE user = ? AND guild = ?',
    );
    bot.setBalance = db.prepare(
      'INSERT OR REPLACE INTO balance (id, user, guild, balance) VALUES (@id, @user, @guild, @balance);',
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

    const embed = new MessageEmbed()
      .setAuthor(`${user.username}'s Balance`)
      .setColor(color)
      .setThumbnail(user.avatarURL({ dynamic: true }))
      .addFields({ name: 'Balance', value: `\`${balance.balance.toLocaleString('en')}\`` });

    message.channel.send(embed);
  },
};
