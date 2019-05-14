const {
    MessageEmbed
} = require("discord.js");
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const encode = require("strict-uri-encode");

module.exports = {
    config: {
        name: "lmgtfy",
        usage: "${prefix}lmgtfy <question>",
        category: "fun",
        description: "Posts a 'Let me Google that for you' link",
        accessableby: "Everyone"
    },
    run: async (bot, message, args, color) => {

        message.delete();
        let question = encode(args.join(" "));
        let link = `https://www.lmgtfy.com/?q=${question}`;

        message.channel.send(`**<${link}>**`);
    }
};