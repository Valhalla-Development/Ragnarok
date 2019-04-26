const Discord = require("discord.js");
const SQLite = require('better-sqlite3');
const generate = require('nanoid/generate');
const custAlpha = '0123456789abcdefghijklmnopqrstuvwxyz';
const db = new SQLite('./Storage/db/db.sqlite');

module.exports.run = async (client, message, args, color) => {
    let language = require(`../messages/messages_en-US.json`);

    const suppRole = db.prepare(`SELECT role FROM ticketConfig WHERE guildid = ${message.guild.id}`).get();

    // "Support" role
    if (!message.guild.roles.find(r => ["Support Team"].includes(r.name)) && !message.guild.roles.find(r => r.id === suppRole.role)) {
        let nomodRole = new Discord.RichEmbed()
            .setColor(`36393F`)
            .setDescription(`${language.tickets.nomodRole}`);
        message.channel.send(nomodRole);
        return;
    }
    // Make sure this is the user's only ticket.
    const foundTicket = db.prepare(`SELECT authorid FROM tickets WHERE guildid = ${message.guild.id} AND authorid = (@authorid)`);
    if (foundTicket.get({authorid: message.author.id})) {
        let existTM = new Discord.RichEmbed()
            .setColor(`36393F`)
            .setDescription(`${language.tickets.existingTicket}`);
        message.channel.send(existTM);
        return;
    }

    const nickName = message.guild.members.get(message.author.id).displayName;

    // Make Ticket
    const id = db.prepare(`SELECT category FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
    let reason = args.slice(0).join(' ') || 'No reason provided.';
    let randomString = generate(custAlpha, 7);
    if (!id) {
        let newTicket = db.prepare(`INSERT INTO tickets (guildid, ticketid, authorid, reason) values (@guildid, @ticketid, @authorid, @reason);`);
        newTicket.run({
            guildid: message.guild.id,
            ticketid: randomString,
            authorid: message.author.id,
            reason: reason
        });
        // Create the channel with the name "ticket-" then the user's ID.
        message.guild.createChannel(`ticket-${nickName}-${randomString}`, "text").then(c => {
            const updateTicketChannel = db.prepare(`UPDATE tickets SET chanid = (@chanid) WHERE guildid = ${message.guild.id} AND ticketid = ${randomString}`);
            updateTicketChannel.run({
                chanid: c.id
            });
            // Apply the appropriate permissions so that only the user and the support team can see it.
            let role = message.guild.roles.find(x => x.name === "Support Team") || message.guild.roles.find(r => r.id === suppRole.role);
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
                .setDescription(`${language.tickets.ticketCreated}, <#${c.id}>.`);
            message.channel.send(newTicketE).then(msg => msg.delete(5000));
            message.delete(5000);
            const embed = new Discord.RichEmbed()
                .setColor(0xCF40FA)
                .setTitle('New Ticket')
                .setDescription(`Hello \`${message.author.tag}\`! Welcome to our support ticketing system. Please hold tight and our administrators will be with you shortly. You can close this ticket at any time using \`-close\`.\n\n\nYou opened this ticket for the reason:\n\`\`\`${reason}\`\`\`\n**NOTE:** If you did not provide a reason, please send your reasoning for opening this ticket now.`);
            c.send(embed);
            // And display any errors in the console.
            const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
            if (!logget) {
                return;
            } else {
                const logchan = message.guild.channels.find(chan => chan.id === logget.log);
                if (!logchan) return;
                let loggingembed = new Discord.RichEmbed()
                    .setColor(color)
                    .setDescription(`${message.author} has opened a new ticket \`#${c.name}\``);
                logchan.send(loggingembed);
            }
        }).catch(console.error);
    } else {
        let newTicket = db.prepare(`INSERT INTO tickets (guildid, ticketid, authorid, reason) values (@guildid, @ticketid, @authorid, @reason);`);
        newTicket.run({
            guildid: message.guild.id,
            ticketid: randomString,
            authorid: message.author.id,
            reason: reason
        });
        const ticategory = id.category;
        // Create the channel with the name "ticket-" then the user's ID.
        message.guild.createChannel(`ticket-${nickName}-${randomString}`, "text").then(async c => {
            const updateTicketChannel = db.prepare(`UPDATE tickets SET chanid = (@chanid) WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`);
            updateTicketChannel.run({
                chanid: c.id,
                ticketid: randomString
            });
            await c.setParent(ticategory);
            // Apply the appropriate permissions so that only the user and the support team can see it.
            let role = message.guild.roles.find(x => x.name === "Support Team") || message.guild.roles.find(r => r.id === suppRole.role);
            let role2 = message.guild.roles.find(x => x.name === "@everyone");
            await c.overwritePermissions(role, {
                SEND_MESSAGES: true,
                READ_MESSAGES: true
            });
            await c.overwritePermissions(role2, {
                SEND_MESSAGES: false,
                READ_MESSAGES: false
            });
            await c.overwritePermissions(message.author, {
                SEND_MESSAGES: true,
                READ_MESSAGES: true
            });
            // Send a message saying the ticket has been created.
            let newTicketE = new Discord.RichEmbed()
                .setColor(`36393F`)
                .setDescription(`${language.tickets.ticketCreated}, <#${c.id}>.`);
            message.channel.send(newTicketE).then(msg => msg.delete(5000));
            message.delete(5000);
            const embed = new Discord.RichEmbed()
                .setColor(0xCF40FA)
                .setTitle('New Ticket')
                .setDescription(`Hello \`${message.author.tag}\`! Welcome to our support ticketing system. Please hold tight and our administrators will be with you shortly. \n\n\nYou opened this ticket for the reason:\n\`\`\`${reason}\`\`\`\n**NOTE:** If you did not provide a reason, please send your reasoning for opening this ticket now.`);
            c.send(embed);
            // And display any errors in the console.
            const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
            if (!logget) {
                return;
            } else {
                const logchan = message.guild.channels.find(chan => chan.id === logget.log);
                if (!logchan) return;
                let loggingembed = new Discord.RichEmbed()
                    .setColor(color)
                    .setDescription(`${message.author} has opened a new ticket \`#${c.name}\``);
                logchan.send(loggingembed);
            }        
        }).catch(console.error);
    }
};
module.exports.help = {
    name: "new"
};