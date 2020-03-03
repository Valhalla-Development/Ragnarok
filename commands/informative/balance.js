const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'balance',
    aliases: ['bal', 'coins'],
    usage: '${prefix}balance',
    category: 'informative',
    description: 'Displays your balance',
    accessableby: 'Everyone',
  },
  run: async (bot, message, args, color) => {
    bot.getBalance = db.prepare(
      'SELECT * FROM balance WHERE user = ? AND guild = ?',
    );
    bot.setBalance = db.prepare(
      'INSERT OR REPLACE INTO balance (id, user, guild, balance) VALUES (@id, @user, @guild, @balance);',
    );

    let balance;
    if (message.guild) {
      balance = bot.getBalance.get(message.author.id, message.guild.id);
    }

    if (!args[0]) {
      const embed = new MessageEmbed()
        .setAuthor(`${message.author.username}'s Balance`)
        .setColor(color)
        .setThumbnail(message.author.displayAvatarURL())
        .addFields({ name: 'Balance', value: balance.balance });

      message.channel.send(embed);
    } else {
      const user = message.mentions.users.first();
      if (!user) {
        const noUserEmbed = new MessageEmbed()
          .setColor('36393F')
          .setDescription(`${language.balance.noUser}`);
        message.channel.send(noUserEmbed);
        return;
      }
      let otherbalance;
      if (!otherbalance) {
        return;
      }
      if (message.guild) {
        otherbalance = bot.getBalance.get(user.id, message.guild.id);
      }
      const otherembed = new MessageEmbed()
        .setAuthor(`${user.username}'s Balance`)
        .setColor(color)
        .setThumbnail(user.displayAvatarURL())
        .addFields({ name: 'Balance', value: otherbalance.balance });

      message.channel.send(otherembed);
    }
  },
};
