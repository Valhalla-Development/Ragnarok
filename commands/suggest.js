const Discord = require('discord.js');
const { supportGuild, supportChannel } = require('../Storage/config.json');

module.exports.run = async (client, message, args, color) => {
    let language = require(`../messages/messages_en-US.json`);

    if (!args[0]) {
        let noinEmbed = new Discord.RichEmbed()
            .setColor('36393F')
            .setDescription(`${language["bugreport"].noInput}`)
        message.channel.send(noinEmbed);
        return;
    };

    let argresult = args.join(" ");

    const embed = new Discord.RichEmbed()
        .setColor('36393F')
        .setTitle("Bug Report")
        .setDescription(`**User: <@${message.author.id}> - **\`${message.author.tag}\`\n**Bug:** ${argresult}`)
        .setFooter(`${message.guild.name} - ${message.guild.id}`)
    client.guilds.get(supportGuild).channels.get(supportChannel).send(embed)

    let loggedEmbed = new Discord.RichEmbed()
    .setColor('36393F')
    .setDescription(`${language["bugreport"].bugLogged}`)
    message.channel.send(loggedEmbed);
};
module.exports.help = {
    name: "suggest"
};