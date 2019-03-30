const Discord = require("discord.js");
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/db/db.sqlite');

module.exports.run = async (client, message, args, color) => {
    const prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);

    let prefix = prefixgrab.prefix;

    const embed = new Discord.RichEmbed()
        .setColor(0xCF40FA)
        .addField(`Ragnarok - Tickets`, `[${prefix}new]() : Opens up a new ticket\n[${prefix}close]() : Closes a ticket that has been resolved\n**Admin commands:**\n[${prefix}add]() : Adds a user to a ticket (copy the user ID)\n[${prefix}remove]() : Removes a user from a ticket (copy the user ID)\n[${prefix}rename]() : Renames the ticket\n[${prefix}forceclose]() : Force closes a ticket`);
    message.channel.send({
        embed: embed
    });
};

module.exports.help = {
    name: "ticket"
};