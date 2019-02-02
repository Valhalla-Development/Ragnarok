const Discord = require("discord.js");
const ms = require("ms");
const SQLite = require('better-sqlite3')
const db = new SQLite('./Storage/db/db.sqlite');

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);


  message.delete();

  const modRole = message.guild.roles.find(r => ["Support Team"].includes(r.name))
  if (!modRole) {
    let nomodRole = new Discord.RichEmbed()
      .setColor(`36393F`)
      .setDescription(`${language["tickets"].nomodRole}`)
    message.channel.send(nomodRole);
    return;
  }

  if (!message.member.roles.has(modRole.id)) {
    let donthaveroleMessage = language["tickets"].donthaveRole;
    const role = donthaveroleMessage.replace(
      "${role}",
      modRole
    );
    let donthaveRole = new Discord.RichEmbed()
      .setColor(`36393F`)
      .setDescription(`${role}`)
    message.channel.send(donthaveRole);
    return;
  };

  if (!message.channel.name.startsWith(`ticket-`)) {
    let badChannel = new Discord.RichEmbed()
      .setColor(`36393F`)
      .setDescription(`${language["tickets"].wrongChannelClose}`)
    message.channel.send(badChannel);
    return;
  };

  if (message.channel.name.startsWith("ticket-")) {
    let fclosecoll = args.join(" ");
    let forceclosetimer = new Discord.RichEmbed()
    .setColor(`36393F`)
    .setTitle(':x: Closing Ticket! :x:')
    .setDescription(`${language["tickets"].closeTimer}`)
    message.channel.send(forceclosetimer)
        message.channel
        .awaitMessages(response => response.author.id === message.author.id, {
            max: 1,
            time: 10000,
            errors: ["time"]
        }).catch(e => {
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

      });        


    //setTimeout(function () {
    //  message.channel.delete();
    //}, ms('10s'));

  };
};

module.exports.help = {
  name: "forceclose"
}