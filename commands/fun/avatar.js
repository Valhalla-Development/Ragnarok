const {
    MessageEmbed
} = require("discord.js");
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
    config: {
        name: "avatar",
        aliases: ["pfp"],
        usage: "${prefix}avatar <@user>",
        category: "fun",
        description: "Displays avatar of specified user",
        accessableby: "Everyone"
    },
    run: async (bot, message, args, color) => {
        let user = message.mentions.users.first() || message.author;

        let embed = new MessageEmbed()
            .setAuthor(`${user.username}'s Avatar`)
            .setImage(user.displayAvatarURL())
            .setColor('36393F');

        message.channel.send(embed);
    }
};