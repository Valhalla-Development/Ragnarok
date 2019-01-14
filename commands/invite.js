const Discord = require("discord.js");

module.exports.run = async (client, message, args) => {

    message.channel.send("This command is temporarily disabled, until the database rewrite is complete. Sorry")
//    let cnt = message.content
//    if (cnt !== " ") {
//        message.delete(10) // ?
//    };
//
//        let embed = new Discord.RichEmbed()
//        .setColor('RANDOM')
//        .setDescription(`:white_check_mark: **Bot Invite Link**: [Click Me!](https://discordapp.com/oauth2/authorize?client_id=508756879564865539&scope=bot&permissions=8)`);
//        message.channel.send(embed);
//    
};
module.exports.help = {
    name: "invite"
};