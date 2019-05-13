const {
    MessageEmbed
} = require("discord.js");
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = {
    config: {
        name: "forceclose",
        usage: "${prefix}forceclose",
        category: "ticket",
        description: "Forcefully closes a ticket",
        accessableby: "Staff"
    },
    run: async (bot, message, args, color) => {
        await message.delete();
        let language = require('../../storage/messages.json');

        const suppRole = db.prepare(`SELECT role FROM ticketConfig WHERE guildid = ${message.guild.id}`).get();
        const modRole = message.guild.roles.find(x => x.name === "Support Team") || message.guild.roles.find(r => r.id === suppRole.role);
        if (!modRole) {
            let nomodRole = new MessageEmbed()
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
            let donthaveRole = new MessageEmbed()
                .setColor(`36393F`)
                .setDescription(`${role}`);
            message.channel.send(donthaveRole);
            return;
        }

        let channelArgs = message.channel.name.split('-');
        let foundTicket = db.prepare(`SELECT * FROM tickets WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`).get({
            ticketid: args[0] || channelArgs[channelArgs.length - 1]
        });
        if (foundTicket) {
            const getChan = message.guild.channels.find(chan => chan.id === foundTicket.chanid);
            let forceclosetimer = new MessageEmbed()
                .setColor(`#36393F`)
                .setTitle(':x: Closing Ticket! :x:')
                .setDescription(`${language.tickets.closeTimer}`);
            getChan.send(forceclosetimer).then(timerMsg => {
                getChan.awaitMessages(resp => resp.author.id === message.author.id || foundTicket.authorid, {
                    max: 1,
                    time: 10000,
                    errors: ['time']
                }).then(() => {
                    let cancelTimer = new MessageEmbed()
                        .setColor(`#36393F`)
                        .setDescription('Canceling Ticket Close');
                    timerMsg.edit(cancelTimer).then(cancelMsg => {
                        cancelMsg.delete(3500);
                    });
                }).catch(() => {
                    getChan.delete();
                    db.prepare(`DELETE FROM tickets WHERE guildid = ${message.guild.id} AND ticketid = (@ticketid)`).run({
                        ticketid: foundTicket.ticketid
                    });
                    const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${message.guild.id};`).get();
                    if (!logget) return;
                    const logchan = message.guild.channels.find(chan => chan.id === logget.log);
                    if (!logchan) return;
                    let loggingembed = new MessageEmbed()
                        .setColor(color)
                        .setDescription(`<@${message.author.id}> has closed ticket \`#${message.channel.name}\``);
                    logchan.send(loggingembed);
                });
            });
        } else {
            let errEmbed = new MessageEmbed()
                .setColor(`#36393F`)
                .setDescription('This ticket could not be found.');
            message.channel.send(errEmbed);
        }
    }
};