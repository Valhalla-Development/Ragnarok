const Discord = require("discord.js");

module.exports.run = async (client, message, args, color) => {

    let hug = [
        "https://media1.tenor.com/images/78b4745385a1b810501be693d2111a16/tenor.gif?itemid=10592461",
        "https://media1.tenor.com/images/d7529f6003b20f3b21f1c992dffb8617/tenor.gif?itemid=4782499",
        "https://media1.tenor.com/images/11b756289eec236b3cd8522986bc23dd/tenor.gif?itemid=10592083",
        "https://media1.tenor.com/images/68f16d787c2dfbf23a4783d4d048c78f/tenor.gif?itemid=9512793",
        "https://media1.tenor.com/images/29a2d3fc01c709ffb2f38cd9dfaf04d2/tenor.gif?itemid=3877439",
        "https://media1.tenor.com/images/0a83956796ff0b04ed8b31ff251ada4b/tenor.gif?itemid=5360972",
        "https://media1.tenor.com/images/392b3313ccde7b5f5c247c34431889c9/tenor.gif?itemid=13191848",
        "https://media1.tenor.com/images/aea31e086df4cc8b31bb2afa99d33124/tenor.gif?itemid=8600754",
        "https://media1.tenor.com/images/baaa8d9726e596c83a2c2eaa7da2d012/tenor.gif?itemid=5106865",
        "https://media1.tenor.com/images/e9be2b47534f1b6478bfbfb568529aa1/tenor.gif?itemid=7674709",
    ];

    let hugresult = Math.floor((Math.random() * hug.length));
    if (!args[0]) {
        const ghembed = new Discord.RichEmbed()
            .setColor(0xFF0000)
            .setTitle(`${message.author.username} hugged themself...! (weirdo)`)
            .setImage('https://media.tenor.com/images/347c4a8b9c5567f01fa7ada234eaa9f4/tenor.gif');
        message.channel.send({
            embed: ghembed
        });
        return;
    }
    var mentionUser = message.mentions.members.first().user.username === message.isMentioned(message.author);

    if (!mentionUser) {
        const hembed = new Discord.RichEmbed()
            .setColor(0xFF0000)
            .setTitle(`${message.author.username} gave ${message.mentions.members.first().user.username} a hug! How sweet!`)
            .setImage(hug[hugresult]);
        message.channel.send({
            embed: hembed
        });
        return;
    }
    const ghembed = new Discord.RichEmbed()
        .setColor(0xFF0000)
        .setTitle(`${message.author.username} hugged themself...! (weirdo)`)
        .setImage('https://media.tenor.com/images/347c4a8b9c5567f01fa7ada234eaa9f4/tenor.gif');
    message.channel.send({
        embed: ghembed
    });
};
module.exports.help = {
    name: "hug"
};