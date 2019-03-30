const Discord = require("discord.js");
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/db/db.sqlite');

module.exports.run = async (client, message, args, color) => {
    let language = require(`../messages/messages_en-US.json`);

    const prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);

    let prefix = prefixgrab.prefix;


    // Make sure it's inside the ticket channel.
    if (!message.channel.name.startsWith(`ticket-`)) {
        let badChannel = new Discord.RichEmbed()
            .setColor(`36393F`)
            .setDescription(`${language.tickets.wrongChannelRename}`);
        message.channel.send(badChannel);
        return;
    }

    const modRole = message.guild.roles.find(r => ["Support Team"].includes(r.name));

    if (!message.member.roles.has(modRole.id)) {
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

      if (args[0] === undefined) {
          let noinp = new Discord.RichEmbed()
          .setColor(`36393F`)
          .setDescription(`${language.tickets.noinp}`);
      }

      let argresult = args.join("-");

      let renamem = new Discord.RichEmbed()
        .setColor(`36393F`)
        .setDescription(`Channel Renamed!`);
    message.channel.send(renamem);
    message.channel.setName(`ticket-${argresult}`);
    const logget = db.prepare(`SELECT channel FROM ticketlog WHERE guildid = ${message.guild.id};`).get();
    if (!logget) {
        return;
    } else {
        const logchan = logget.channel;
        let loggingembed = new Discord.RichEmbed()
            .setColor(color)
            .setDescription(`<@${message.author.id}> renamed ticket from \`#${message.channel.name}\` to <#${message.channel.id}>`);
        client.channels.get(logchan).send(loggingembed);
        }
  

    };    

module.exports.help = {
    name: "rename"
};