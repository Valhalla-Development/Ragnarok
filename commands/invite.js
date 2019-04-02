const Discord = require("discord.js");

module.exports.run = async (client, message, args, color) => {

    message.delete(0); // ?

    let embed = new Discord.RichEmbed()
        .setColor('36393F')
        .setDescription(`:white_check_mark: **Bot Invite Link**: [Click Me!](https://discordapp.com/oauth2/authorize?client_id=508756879564865539&scope=bot&permissions=8)`);
    message.channel.send(embed);

};
module.exports.help = {
    name: "invite"
};