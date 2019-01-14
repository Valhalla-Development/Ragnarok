const Discord = require("discord.js");
const fs = require("fs");
const prefixes = JSON.parse(fs.readFileSync("./Storage/prefixes.json", "utf8"));

module.exports.run = async (client, message, args, color) => {
    let prefix = prefixes[message.guild.id].prefixes;


    // Make sure it's inside the ticket channel.
    if (!message.channel.name.startsWith(`ticket-`)) return message.channel.send(`You can't use the close command outside of a ticket channel.`);
    // Ask for confirmation within 10 seconds.
    message.channel.send(`Are you sure? Once confirmed, you cannot reverse this action!\nTo confirm, type \`${prefix}confirm\`. This will time out in 20 seconds and be cancelled.`)
        .then((m) => {
            message.channel.awaitMessages(response => response.content === prefix + 'confirm', {
                    max: 1,
                    time: 20000,
                    errors: ['time'],
                })
                // If confirmed:
                .then((collected) => {
                    // Delete the channel.
                    message.channel.delete();
                })
                // If timed out:
                .catch(() => {
                    // Abort ticket deletion.
                    m.edit('Ticket close timed out, the ticket was not closed.').then(m2 => {
                        m2.delete();
                    }, 3000);
                });
        });
}


module.exports.help = {
    name: "close"
};