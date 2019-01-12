const Discord = require("discord.js");
const fs = require("fs");
const prefixes = JSON.parse(fs.readFileSync("./Storage/prefixes.json", "utf8"));

module.exports.run = async (client, message, args, color) => {
    let prefix = prefixes[message.guild.id].prefixes;

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
    name: "t"
};