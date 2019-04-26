const Discord = require("discord.js");
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/db/db.sqlite');

module.exports.run = async (client, message, args, color) => {
    let language = require(`../messages/messages_en-US.json`);

    const suppRole = db.prepare(`SELECT role FROM ticketConfig WHERE guildid = ${message.guild.id}`).get();
    const modRole = message.guild.roles.find(x => x.name === "Support Team") || message.guild.roles.find(r => r.id === suppRole.role);
    if (!modRole) {
        let nomodRole = new Discord.RichEmbed()
        .setColor(`36393F`)
        .setDescription(`${language.tickets.nomodRole}`);
        message.channel.send(nomodRole);
        return;
    }

    if (!message.member.roles.has(modRole.id) && message.author.id !== message.guild.ownerID) {
        let donthaveroleMessage = language.tickets.donthaveRole;
        const role = donthaveroleMessage.replace(
        "${role}",
        modRole
        );
        let donthaveRole = new Discord.RichEmbed()
        .setColor(`36393F`)
        .setDescription(`${role}`);
        message.channel.send(donthaveRole);
        return;
    }

    let foundTicket = db.prepare(`SELECT * FROM tickets WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`).get({ticketid: args[0]});
    if (foundTicket) {
        const getChan = message.guild.channels.find(chan => chan.id === foundTicket.chanid);
        let argResult = args.splice(1).join('-');
        getChan.setName(`${argResult}-${foundTicket.ticketid}`);
        const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
        const logchan = message.guild.channels.find(chan => chan.id === logget.log);
        if (!logchan) return;
        let loggingembed = new Discord.RichEmbed()
            .setColor(color)
            .setDescription(`<@${message.author.id}> renamed ticket from \`#${getChan.name}\` to <#${getChan.id}>`);
        logchan.send(loggingembed);
    } else if (!foundTicket && message.channel.name.startsWith(`ticket`)) {
        const channelArgs = message.channel.name.split('-');
        foundTicket = db.prepare(`SELECT * from tickets WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`).get({ticketid: channelArgs[channelArgs.length - 1]});
        let argResult = args.join('-');
        message.channel.setName(`${argResult}-${foundTicket.ticketid}`);
        const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
        const logchan = message.guild.channels.find(chan => chan.id === logget.log);
        if (!logchan) return;
        let loggingembed = new Discord.RichEmbed()
            .setColor(color)
            .setDescription(`<@${message.author.id}> renamed ticket from \`#${message.channel.name}\` to <#${message.channel.id}>`);
        logchan.send(loggingembed);
    } else if (!foundTicket && !message.channel.name.startsWith(`ticket-`)) {
        let errEmbed = new Discord.RichEmbed()
          .setColor(`#36393F`)
          .setDescription('This ticket could not be found.');
        message.channel.send(errEmbed);
    }
};    

module.exports.help = {
    name: "rename"
};