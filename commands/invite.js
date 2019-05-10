const Discord = require("discord.js");

module.exports.run = async (client, message, args, color) => {

    message.delete(0); // ?

    let embed = new Discord.RichEmbed()
        .setColor('36393F')
        .setDescription(`:white_check_mark: **Bot Invite Link**: https://invite.ragnarokbot.tk`);
    message.channel.send(embed);

};
module.exports.help = {
    name: "invite"
};