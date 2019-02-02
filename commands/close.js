const Discord = require("discord.js");
const SQLite = require('better-sqlite3')
const db = new SQLite('./Storage/db/db.sqlite');

module.exports.run = async (client, message, args, color) => {
    let language = require(`../messages/messages_en-US.json`);

    const prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);

    let prefix = prefixgrab.prefix;



    // Make sure it's inside the ticket channel.
    if (!message.channel.name.startsWith(`ticket-`)) {
        let badChannel = new Discord.RichEmbed()
            .setColor(`36393F`)
            .setDescription(`${language["tickets"].wrongChannelClose}`)
        message.channel.send(badChannel);
        return;
    };
    // Ask for confirmation within 10 seconds.
    let confirmCloseMessage = language["tickets"].closeConfirm;
    const confirmClose = confirmCloseMessage.replace(
        "${prefix}",
        prefix
    );
    let confirmEmbed = new Discord.RichEmbed()
        .setColor(`36393F`)
        .setDescription(`${confirmClose}`)
    message.channel.send(confirmEmbed)
        .then((m) => {
            message.channel.awaitMessages(response => response.content === prefix + 'confirm', {
                    max: 1,
                    time: 20000,
                    errors: ['time'],
                })
                .then((collected) => {
                    message.channel.delete();
                    const logget = db.prepare(`SELECT channel FROM ticketlog WHERE guildid = ${message.guild.id};`).get();
                    if (!logget) {
                        return;
                    } else {
                        const logchan = logget.channel
                        let loggingembed = new Discord.RichEmbed()
                            .setColor(color)
                            .setDescription(`<@${message.author.id}> has closed ticket \`#${message.channel.name}\``);
                        client.channels.get(logchan).send(loggingembed);
                        }            
                })
                .catch(() => {
                    m.delete()
                });
        });
}


module.exports.help = {
    name: "close"
};