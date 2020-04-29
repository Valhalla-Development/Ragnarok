/* eslint-disable brace-style */
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'gamble',
    usage: '${prefix}gamble <amount>',
    category: 'fun',
    description: 'Gambles specified amount',
    accessableby: 'Everyone',
  },
  run: async (bot, message, args) => {
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

    let balance;
    if (message.guild) {
      balance = bot.getBalance.get(message.author.id, message.guild.id);
    }

    if (!args[0]) {
      const noinput = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`${language.slot.noArgs}`)
        .addFields({ name: 'Current Balance', value: balance.balance });
      message.channel.send(noinput);
      return;
    }

    const gambledCoins = parseInt(args[0]);

    if (!gambledCoins) {
      const noan = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`${language.slot.naN}`);
      message.channel.send(noan);
      return;
    }

    if (gambledCoins < 10) {
      const noan = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`${language.slot.invalidAmount}`);
      message.channel.send(noan);
      return;
    }

    if (gambledCoins > balance.balance) {
      const noan = new MessageEmbed()
        .setColor('36393F')
        .setDescription(
          `:x: **You do not have that many coins! You only have \`\`${balance.balance}\`\` coins!**`,
        );
      message.channel.send(noan);
      return;
    }

    let amt;

    const randomN = ~~(Math.random() * 20) + 1;

    // if the randomN is 1-3, multiply the money by 60-90%
    if (randomN === '1' || randomN === '2' || randomN === '3') {
      const randomP = ~~(Math.random() * 30) + 1 + 60;
      const rand = parseFloat(`0.${randomP}`);
      amt = gambledCoins + gambledCoins * rand;
    }
    // if the randomN is 4, multiply the money by 2x
    else if (randomN === '4') { amt = gambledCoins * 2; }
    // if the randomN is 5-8 give their money back
    else if (randomN === '5' || randomN === '6' || randomN === '7') { amt = gambledCoins; }
    // if the randomN is 8 or 9 give them 50%-80% of what they gambled back
    else if (randomN === '8' || randomN === '9') {
      const randomP = ~~(Math.random() * 30) + 1 + 50;
      const rand = parseFloat(`0.${randomP}`);
      amt = gambledCoins * rand;
    }

    // if the randomN is 10 give them 10%-40% of what they gambled back
    else if (randomN === '10') {
      const randomP = ~~(Math.random() * 30) + 1 + 10;
      const rand = parseFloat(`0.${randomP}`);
      amt = gambledCoins * rand;
    }

    // if the randomN is 11-20 give them nothing back
    else { amt = 0; }

    // create an empty array for the emojis
    const randEmojis = [];

    // loop through 9 times, get a random emoji, and add it to the randEmojis array
    for (let i = 0; i < 9; i++) {
      const rand = ~~(Math.random() * 4) + 1;
      if (rand === 1) randEmojis.push(':cloud_rain:');
      if (rand === 2) randEmojis.push(':earth_americas:');
      if (rand === 3) randEmojis.push(':apple:');
      if (rand === 4) randEmojis.push(':fire:');
    }
    amt = ~~amt;
    const newbal = balance.balance - gambledCoins + amt;
    // send the message
    const slotembed = new MessageEmbed()
      .setColor('36393F')
      .addFields({
        name: '**SLOTS**',
        value: `${randEmojis[0]} | ${randEmojis[1]} | ${randEmojis[2]}\n${
          randEmojis[3]
        } | ${randEmojis[4]} | ${randEmojis[5]}\n${randEmojis[6]} | ${
          randEmojis[7]
        } | ${randEmojis[8]}\n${
          message.member
        } you gambled **${gambledCoins}** coins and recieved back **${amt}** coins!\nYour balance is now **${newbal}**`,
      });
    message.channel.send(slotembed);

    // set the coins for the user
    balance.balance -= gambledCoins;
    balance.balance += amt;
    bot.setBalance.run(balance);
  },
};
