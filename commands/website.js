const Discord = require("discord.js");

module.exports.run = async (client, message, args, color) => {

    let cnt = message.content
    if (cnt !== " ") {
        message.delete(10) // ?
    };

    let embed = new Discord.RichEmbed()
        .setColor('36393F')
        .setDescription(`:globe_with_meridians: **Website:** https://www.ragnarokbot.tk/`);
    message.channel.send(embed);

};
module.exports.help = {
    name: "website"
};