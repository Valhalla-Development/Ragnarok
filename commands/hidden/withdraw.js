/* eslint-disable no-restricted-globals */
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
  config: {
    name: 'withdraw',
    aliases: ['draw'],
    usage: '${prefix}withdraw <amount>/<all>',
    category: 'hidden',
    description: 'Withdraws specified amount of money',
    accessableby: 'Everyone',
  },
  run: async (bot, message, args) => {
    const prefixgrab = db
      .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
      .get(message.guild.id);
    const { prefix } = prefixgrab;

    bot.getBalance = db.prepare(
      'SELECT * FROM balance WHERE user = ? AND guild = ?',
    );

    bot.setBalance = db.prepare(
      'INSERT OR REPLACE INTO balance (user, guild, cash, bank, total) VALUES (@user, @guild, @cash, @bank, @total);',
    );

    let balance;
    if (message.guild) {
      balance = bot.getBalance.get(message.author.id, message.guild.id);
    }

    const noBal = 'You have no balance';
    if (!balance) {
      message.channel.send(noBal);
      return;
    }

    const numberCov = Number(args[0]);

    if (balance.bank === 0) {
      const noBal = new MessageEmbed()
        .setAuthor(`${message.author.tag}`, message.author.avatarURL())
        .setColor('36393F')
        .setDescription(':x: Uh oh! You currently have no money in your bank!');
      message.channel.send(noBal);
      return;
    }

    if (args[0] === 'all') {
      const bankCalc = balance.cash + balance.bank;
      const addAll = {
        user: message.author.id,
        guild: message.guild.id,
        cash: bankCalc,
        bank: 0,
        total: bankCalc,
      };

      bot.setBalance.run(addAll);
      const depAll = new MessageEmbed()
        .setAuthor(`${message.author.username}`, message.author.avatarURL())
        .setColor('36393F')
        .setDescription(`:white_check_mark: Success!\n You have withdrawn <:coin:706659001164628008> ${balance.bank.toLocaleString('en')}.`);
      message.channel.send(depAll);
      return;
    }

    if (isNaN(args[0]) || args.length > 1) {
      const wrongUsage = new MessageEmbed()
        .setAuthor(`${message.author.tag}`, message.author.avatarURL())
        .setColor('36393F')
        .setDescription(`:x: Incorrect usage! An example of this command is: \`${prefix}withdraw 100\`\nAlternatively, you can run \`${prefix}withdraw all\``);
      message.channel.send(wrongUsage);
      return;
    }

    if (args[0] > balance.bank) {
      const wrongUsage = new MessageEmbed()
        .setAuthor(`${message.author.tag}`, message.author.avatarURL())
        .setColor('36393F')
        .setDescription(`:x: Uh oh! You only have <:coin:706659001164628008> ${balance.bank.toLocaleString('en')}. Please try again with a valid amount.`);
      message.channel.send(wrongUsage);
      return;
    }

    const cashA = balance.cash + numberCov;
    const bankA = balance.bank - numberCov;
    const totaA = balance.total;

    const addAll = {
      user: message.author.id,
      guild: message.guild.id,
      cash: cashA,
      bank: bankA,
      total: totaA,
    };

    bot.setBalance.run(addAll);

    const depAll = new MessageEmbed()
      .setAuthor(`${message.author.username}`, message.author.avatarURL())
      .setColor('36393F')
      .setDescription(`:white_check_mark: Success!\n You have withdrawn <:coin:706659001164628008> ${numberCov.toLocaleString('en')}.`);
    message.channel.send(depAll);
  },
};
