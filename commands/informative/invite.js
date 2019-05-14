const {
    MessageEmbed
} = require("discord.js");

module.exports = {
    config: {
        name: "invite",
        usage: "${prefix}invite",
        category: "informative",
        description: "Posts a bot invite link",
        accessableby: "Everyone"
    },
    run: async (bot, message, args, color) => {

        message.delete();

        let embed = new MessageEmbed()
            .setColor('36393F')
            .setDescription(`:white_check_mark: **Bot Invite Link**: https://invite.ragnarokbot.tk`);
        message.channel.send(embed);
    }
};