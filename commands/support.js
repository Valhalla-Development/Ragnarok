const Discord = require("discord.js");

module.exports.run = async (client, message, args, color) => {

    let cnt = message.content
    if (cnt !== " ") {
        message.delete(10) // ?
    };

    let embed = new Discord.RichEmbed()
        .setColor('36393F')
        .setDescription(`:white_check_mark: **Support Server Invite**: https://discord.gg/Q3ZhdRJ`);
    message.channel.send(embed);

};
module.exports.help = {
    name: "support"
};