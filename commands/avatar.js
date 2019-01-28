const Discord = require("discord.js");

module.exports.run = async (client, message, args, color) => {

    let user = message.mentions.users.first() || message.author;

    let embed = new Discord.RichEmbed()
        .setAuthor(`${user.username}'s Avatar`)
        .setImage(user.displayAvatarURL)
        .setColor('36393F')

    message.channel.send(embed)
};

module.exports.help = {
    name: "avatar"
};