const Discord = require("discord.js");
const SQLite = require('better-sqlite3')
const db = new SQLite('./Storage/db/db.sqlite');

module.exports.run = async (client, message, args, color) => {
    const prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);

    let prefix = prefixgrab.prefix;
  
        const embed = new Discord.RichEmbed()
            .setTitle(`Ragnarok - Tickets`)
            .setColor(0xCF40FA)
            .setDescription(`Hello! I'm Ragnarok!`)
            .addField(`Tickets`, `[${prefix}new]() : Opens up a new ticket\n[${prefix}close]() : Closes a ticket that has been resolved or been opened by accident`)
        message.channel.send({
            embed: embed
        });
    };

module.exports.help = {
    name: "ticket"
};