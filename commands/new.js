const Discord = require("discord.js");
const SQLite = require('better-sqlite3')
const db = new SQLite('./Storage/db/db.sqlite');

module.exports.run = async (client, message, args, color) => {
    let language = require(`../messages/messages_en-US.json`);

    const prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);

    let prefix = prefixgrab.prefix;

    // And they specify a reason:
    const reason = message.content.split(" ").slice(1).join(" ");
    // Make sure the "Support Team" role exists in the server.
    if (!message.guild.roles.some(r => ["Support Team"].includes(r.name))) {
        let nomodRole = new Discord.RichEmbed()
            .setColor(`36393F`)
            .setDescription(`${language["tickets"].nomodRole}`)
        message.channel.send(nomodRole);
        return;
    };
    // Make sure this is the user's only ticket.
    const nickName = message.guild.members.get(message.author.id).displayName
    const userConv = nickName.toLowerCase().replace(/ /g, "-");
    if (message.guild.channels.some(c => [`ticket-${userConv}`].includes(c.name))) {
        let existTM = new Discord.RichEmbed()
            .setColor(`36393F`)
            .setDescription(`${language["tickets"].existingTicket}`)
        message.channel.send(existTM);
        return;
    };
    // Create the channel with the name "ticket-" then the user's ID.
    message.guild.createChannel(`ticket-${nickName}`, "text").then(c => {
        // Apply the appropriate permissions so that only the user and the support team can see it.
        let role = message.guild.roles.find(x => x.name === "Support Team");
        let role2 = message.guild.roles.find(x => x.name === "@everyone");
        c.overwritePermissions(role, {
            SEND_MESSAGES: true,
            READ_MESSAGES: true
        });
        c.overwritePermissions(role2, {
            SEND_MESSAGES: false,
            READ_MESSAGES: false
        });
        c.overwritePermissions(message.author, {
            SEND_MESSAGES: true,
            READ_MESSAGES: true
        });
        // Send a message saying the ticket has been created.
        let newTicketE = new Discord.RichEmbed()
            .setColor(`36393F`)
            .setDescription(`${language["tickets"].ticketCreated}, <#${c.id}>.`)
        message.channel.send(newTicketE).then(msg => msg.delete(5000));
        message.delete(5000);
        let ticketMessageMessage = language["tickets"].ticketMessage;
        const ticketm = ticketMessageMessage.replace(
            "${nick}",
            nickName
        );
        const embed = new Discord.RichEmbed()
            .setColor(0xCF40FA)
            .setDescription(`${ticketm}`)
        c.send({
            embed: embed
        });
        // And display any errors in the console.
    }).catch(console.error);

};
module.exports.help = {
    name: "new"
};