const {
    MessageEmbed
} = require("discord.js");
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
    config: {
        name: "gamble",
        usage: "${prefix}gamble <amount>",
        category: "fun",
        description: "Gambles specified amount",
        accessableby: "Everyone"
    },
    run: async (bot, message, args, color) => {
        let language = require('../../storage/messages.json');

        const table = db.prepare("SELECT count(*) FROM sqlite_master WHERE type='table' AND name = 'balance';").get();
        bot.getBalance = db.prepare("SELECT * FROM balance WHERE user = ? AND guild = ?");
        bot.setBalance = db.prepare("INSERT OR REPLACE INTO balance (id, user, guild, balance) VALUES (@id, @user, @guild, @balance);");

        let balance;
        if (message.guild) {
            balance = bot.getBalance.get(message.author.id, message.guild.id);
        }


        if (!args[0]) {
            let noinput = new MessageEmbed()
                .setColor(`36393F`)
                .setDescription(`${language.slot.noArgs}`)
                .addField("Current Balance", balance.balance);
            message.channel.send(noinput);
            return;
        }

        let gambledCoins = parseInt(args[0]);

        if (!gambledCoins) {
            let noan = new MessageEmbed()
                .setColor(`36393F`)
                .setDescription(`${language.slot.naN}`);
            message.channel.send(noan);
            return;
        }

        if (gambledCoins < 10) {
            let noan = new MessageEmbed()
                .setColor(`36393F`)
                .setDescription(`${language.slot.invalidAmount}`);
            message.channel.send(noan);
            return;
        }

        if (gambledCoins > balance.balance) {
            let noan = new MessageEmbed()
                .setColor(`36393F`)
                .setDescription(":x: **You do not have that many coins! You only have ``" + balance.balance + "`` coins!**");
            message.channel.send(noan);
            return;
        }

        let amt;

        let randomN = ~~(Math.random() * 20) + 1;

        //if the randomN is 1-3, multiply the money by 60-90%
        if (randomN == "1" || randomN == "2" || randomN == "3") {
            let randomP = (~~(Math.random() * 30) + 1) + 60;
            let rand = parseFloat(`0.${randomP}`);
            amt = gambledCoins + (gambledCoins * rand);

        }
        //if the randomN is 4, multiply the money by 2x
        else if (randomN == "4")
            amt = gambledCoins * 2;

        //if the randomN is 5-8 give their money back
        else if (randomN == "5" || randomN == "6" || randomN == "7")
            amt = gambledCoins;

        //if the randomN is 8 or 9 give them 50%-80% of what they gambled back
        else if (randomN == "8" || randomN == "9") {
            let randomP = (~~(Math.random() * 30) + 1) + 50;
            let rand = parseFloat(`0.${randomP}`);
            amt = gambledCoins * rand;
        }

        //if the randomN is 10 give them 10%-40% of what they gambled back
        else if (randomN == "10") {
            let randomP = (~~(Math.random() * 30) + 1) + 10;
            let rand = parseFloat(`0.${randomP}`);
            amt = gambledCoins * rand;
        }

        //if the randomN is 11-20 give them nothing back
        else amt = 0;


        //create an empty array for the emojis
        let randEmojis = [];

        //loop through 9 times, get a random emoji, and add it to the randEmojis array
        for (let i = 0; i < 9; i++) {
            let rand = ~~(Math.random() * 4) + 1;
            if (rand == 1) randEmojis.push(":cloud_rain:");
            if (rand == 2) randEmojis.push(":earth_americas:");
            if (rand == 3) randEmojis.push(":apple:");
            if (rand == 4) randEmojis.push(":fire:");
        }
        amt = ~~amt;
        let newbal = balance.balance - gambledCoins + amt;
        //send the message
        let slotembed = new MessageEmbed()
            .setColor("#098aed")
            .addField("**SLOTS**", `${randEmojis[0]} | ${randEmojis[1]} | ${randEmojis[2]}\n${randEmojis[3]} | ${randEmojis[4]} | ${randEmojis[5]}\n${randEmojis[6]} | ${randEmojis[7]} | ${randEmojis[8]}\n${message.member} you gambled **${gambledCoins}** coins and recieved back **${amt}** coins!\nYour balance is now **${newbal}**`);
        message.channel.send(slotembed);

        //set the coins for the user
        balance.balance -= gambledCoins;
        balance.balance += amt;
        bot.setBalance.run(balance);
    }
};