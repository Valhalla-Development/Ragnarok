/* eslint-disable no-restricted-globals */
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const bankLimit = Number(500000);

module.exports = {
  config: {
    name: 'give',
    aliases: ['pay'],
    usage: '${prefix}give <@user> <amount>/<all>',
    category: 'hidden',
    description: 'Gives specified user a specified amount of money',
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
    bot.setUserBalance = db.prepare(
      'INSERT OR REPLACE INTO balance (user, guild, cash, bank, total) VALUES (@user, @guild, @cash, @bank, @total);',
    );

    const user = message.mentions.users.first();
    if (user.bot) return;

    if (!user) {
      const wrongUsage = new MessageEmbed()
        .setAuthor(`${message.author.tag}`, message.author.avatarURL())
        .setColor('36393F')
        .setDescription(`:x: Incorrect usage! An example of this command is: \`${prefix}give @user 100\`\nAlternatively, you can run \`${prefix}give @user all\``);
      message.channel.send(wrongUsage);
      return;
    }

    let balance;
    let otherB;
    if (message.guild) {
      balance = bot.getBalance.get(message.author.id, message.guild.id);
      otherB = bot.getBalance.get(user.id, message.guild.id);
    }

    if (!balance) {
      message.channel.send('You have no balance');
      return;
    }
    if (!otherB) {
      const noBalSet = {
        user: user.id,
        guild: message.guild.id,
        cash: 0,
        bank: 1000,
        total: 1000,
      };
      bot.setUserBalance.run(noBalSet);
      message.channel.send('An error occurred, please try again');
      return;
    }


    if (balance.bank === 0) {
      const noBal = new MessageEmbed()
        .setAuthor(`${message.author.tag}`, message.author.avatarURL())
        .setColor('36393F')
        .setDescription(':x: Uh oh! You currently have no money in your bank!');
      message.channel.send(noBal);
      return;
    }

    if (args[1] === 'all') {
      if (otherB.bank + balance.bank > bankLimit) {
        message.channel.send(`Transferring your entire bank would exceed the target users bank limit! They have <:coin:706659001164628008> \`${bankLimit - otherB.balance}\` available space!`);
        return;
      }

      const totaCalc1 = otherB.total + balance.bank;
      const setUse = {
        user: user.id,
        guild: message.guild.id,
        cash: otherB.cash,
        bank: balance.bank + otherB.bank,
        total: totaCalc1,
      };

      bot.setUserBalance.run(setUse);

      const totaCalc2 = balance.total - balance.bank;
      const addAut = {
        user: message.author.id,
        guild: message.guild.id,
        cash: balance.cash,
        bank: 0,
        total: totaCalc2,
      };

      bot.setBalance.run(addAut);

      const depAll = new MessageEmbed()
        .setAuthor(`${message.author.username}`, message.author.avatarURL())
        .setColor('36393F')
        .setDescription(`:white_check_mark: Success!\n You have paid ${user} the sum of: <:coin:706659001164628008> ${balance.bank.toLocaleString('en')}.`);
      message.channel.send(depAll);
      return;
    }

    if (isNaN(args[1]) || args.length > 2) {
      const wrongUsage = new MessageEmbed()
        .setAuthor(`${message.author.tag}`, message.author.avatarURL())
        .setColor('36393F')
        .setDescription(`:x: Incorrect usage! An example of this command is: \`${prefix}give @user 100\`\nAlternatively, you can run \`${prefix}give @user all\``);
      message.channel.send(wrongUsage);
      return;
    }

    if (args[1] > balance.bank) {
      const wrongUsage = new MessageEmbed()
        .setAuthor(`${message.author.tag}`, message.author.avatarURL())
        .setColor('36393F')
        .setDescription(`:x: Uh oh! You only have <:coin:706659001164628008> ${balance.bank.toLocaleString('en')}. Please try again with a valid amount.`);
      message.channel.send(wrongUsage);
      return;
    }

    const numberCov = Number(args[1]);

    const totaCalc1 = otherB.total + numberCov;
    const setUse = {
      user: user.id,
      guild: message.guild.id,
      cash: otherB.cash,
      bank: numberCov + otherB.bank,
      total: totaCalc1,
    };

    bot.setUserBalance.run(setUse);

    const totaCalc2 = balance.total - balance.bank;
    const addAut = {
      user: message.author.id,
      guild: message.guild.id,
      cash: balance.cash,
      bank: balance.bank - numberCov,
      total: totaCalc2,
    };

    bot.setBalance.run(addAut);

    const depArg = new MessageEmbed()
      .setAuthor(`${message.author.username}`, message.author.avatarURL())
      .setColor('36393F')
      .setDescription(`:white_check_mark: Success!\n You have paid ${user} the sum of: <:coin:706659001164628008> ${numberCov.toLocaleString('en')}.`);
    message.channel.send(depArg);
  },
};
