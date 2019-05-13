const {
    MessageEmbed
} = require("discord.js");
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
    config: {
        name: "coinflip",
        usage: "${prefix}coinflip",
        category: "fun",
        description: "Flips a coin",
        accessableby: "Everyone"
    },
    run: async (bot, message, args, color) => {
        const rolled = Math.floor(Math.random() * 2) + 1;
        let headembed = new MessageEmbed()
            .setAuthor(`Coin Flip`)
            .addField(`Result`, `You flipped a: **Heads**!`)
            .setColor("0xff1053");
        let tailembed = new MessageEmbed()
            .setAuthor(`Coin Flip`)
            .addField(`Result`, `You flipped a: **Tails**!`)
            .setColor("0x00bee8");
        if (rolled == "1") {
            message.channel.send(tailembed);
        }
        if (rolled == "2") {
            message.channel.send(headembed);
        }
    }
};