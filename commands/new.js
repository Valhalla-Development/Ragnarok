const Discord = require("discord.js");
const SQLite = require('better-sqlite3')
const db = new SQLite('./Storage/db/db.sqlite');

module.exports.run = async (client, message, args, color) => {
    const prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);

    let prefix = prefixgrab.prefix;
  
        // And they specify a reason:
        const reason = message.content.split(" ").slice(1).join(" ");
        // Make sure the "Support Team" role exists in the server.
        if (!message.guild.roles.some(r => ["Support Team"].includes(r.name))) return message.channel.send(`This server doesn't have a \`Support Team\` role made, so the ticket won't be opened.\nIf you are an administrator, make one with that name exactly and give it to users that should be able to see tickets.`);
        // Make sure this is the user's only ticket.
        const nickName = message.guild.members.get(message.author.id).displayName
        const userConv = nickName.toLowerCase().replace(/ /g, "-");
        if (message.guild.channels.some(c => [`ticket-${userConv}`].includes(c.name))) return message.channel.send(`:x: | **You already have a ticket open!**`);
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
                .setDescription(`:white_check_mark: Your ticket has been created, <#${c.id}>.`)
            message.channel.send(newTicketE);            // Send a message in the ticket.
            const embed = new Discord.RichEmbed()
                .setColor(0xCF40FA)
                .addField(`Hey there, ${nickName}!`, `A member from the Support Team will be with you soon!\nPlease try to explain your issue while you are waiting.`)
                .setTimestamp();
            c.send({
                embed: embed
            });
            // And display any errors in the console.
        }).catch(console.error);

    };
module.exports.help = {
    name: "new"
};