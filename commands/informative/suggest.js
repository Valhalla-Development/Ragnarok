const {
    MessageEmbed
} = require("discord.js");
const {
    supportGuild,
    supportChannel
} = require('../../storage/config.json');

module.exports = {
    config: {
        name: "suggest",
        usage: "${prefix}suggest <text>",
        category: "informative",
        description: "Sends a message to the bot owner",
        accessableby: "Everyone"
    },
    run: async (bot, message, args, color) => {

        message.delete();
        let language = require('../../storage/messages.json');

        if (!args[0]) {
            let noinEmbed = new MessageEmbed()
                .setColor('36393F')
                .setDescription(`${language.bugreport.noInput}`);
            message.channel.send(noinEmbed);
            return;
        }

        let argresult = args.join(" ");

        const embed = new MessageEmbed()
            .setColor('36393F')
            .setTitle("Bug Report")
            .setDescription(`**User: <@${message.author.id}> - **\`${message.author.tag}\`\n**Bug:** ${argresult}`)
            .setFooter(`${message.guild.name} - ${message.guild.id}`);
        bot.guilds.get(supportGuild).channels.get(supportChannel).send(embed);

        let loggedEmbed = new MessageEmbed()
            .setColor('36393F')
            .setDescription(`${language.bugreport.bugLogged}`);
        message.channel.send(loggedEmbed);
    }
};