const Discord = require("discord.js");
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/db/db.sqlite');

module.exports.run = async (client, message, args, color) => {
    const prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);
    let prefix = prefixgrab.prefix;

    const embed = new Discord.RichEmbed()
        .setColor(0xCF40FA)
        .addField(`Ragnarok - Tickets`, `[${prefix}new]() (reason) : Opens up a new ticket\n[${prefix}close]() : Closes a ticket that has been resolved
            \n**Admin Commands:** (Run Inside of a Ticket Channel)\n[${prefix}add]() : Adds a user to a ticket (mention a user)\n[${prefix}remove]() : Removes a user from a ticket (mention a user)\n[${prefix}rename]() : Renames the ticket\n[${prefix}forceclose]() : Force closes a ticket
            \n**Global Admin Commands:** (Can Be Run Anywhere in the Server)\n[${prefix}add]() [@user] [ticketid]: Adds a user to a ticket (mention a user)\n[${prefix}remove]() [@user] [ticketid] : Removes a user from a ticket (mention a user)\n[${prefix}rename]() [ticketid] [newname] : Renames the ticket\n[${prefix}forceclose]() [ticketid] : Force closes a ticket
            \n\n**NOTE:** The ticket ID is the last 7 characters of a ticket channel. Also, for those new to reading a command menu, don't run the commands with the parentheses or brackets. They are there ONLY to specify that it needs an input and is not an integral part of the command.`);
    message.channel.send({
        embed: embed
    });
};

module.exports.help = {
    name: "ticket"
};