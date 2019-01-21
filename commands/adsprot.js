const SQLite = require('better-sqlite3')
const db = new SQLite('./Storage/db/db.sqlite');
const fs = require("fs");
const config = JSON.parse(
  fs.readFileSync("./Storage/config.json", "utf8")
);
const Discord = require("discord.js");

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  const prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);

  let prefix = prefixgrab.prefix;

  // perms checking

  if ((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== config.ownerID))) {
    let invalidpermsembed = new Discord.RichEmbed()
    .setColor(`36393F`)
    .setDescription(`${language["adsprot"].noPermission}`)
    message.channel.send(invalidpermsembed);
    return;
  };

  // preparing count

  client.getTable = db.prepare("SELECT * FROM adsprot WHERE guildid = ?");
  let status;
  if (message.guild.id) {
    status = client.getTable.get(message.guild.id);

    if (args[0] === "on") {
      // if already on
      if (status) {
        let alreadyOnMessage = language["adsprot"].alreadyOn;
        const alreadyOn = alreadyOnMessage.replace(
          "${prefix}",
          prefix
        );
        let alreadyonembed = new Discord.RichEmbed()
        .setColor(`36393F`)
        .setDescription(`${alreadyOn}`)
        message.channel.send(alreadyonembed);
        return;
      } else {
        const insert = db.prepare("INSERT INTO adsprot (guildid, status) VALUES (@guildid, @status);");
        insert.run({
          guildid: `${message.guild.id}`,
          status: 'on'
        });
        let turnonembed = new Discord.RichEmbed()
        .setColor(`36393F`)
        .setDescription(`${language["adsprot"].turnedOn}`);
        message.channel.send(turnonembed);
      };

      // if args = off
    } else if (args[0] === "off") {
      // if already off
      if (!status) {
        let alreadyOffMessage = language["adsprot"].alreadyOff;
        const alreadyOff = alreadyOffMessage.replace(
          "${prefix}",
          prefix
        );
        let alreadyoffembed = new Discord.RichEmbed()
        .setColor(`36393F`)
        .setDescription(`${alreadyOff}`)
        message.channel.send(alreadyoffembed);
        return;
      } else {
        db.prepare("DELETE FROM adsprot WHERE guildid = ?").run(message.guild.id);
        let turnedoffembed = new Discord.RichEmbed()
        .setColor(`36393F`)
        .setDescription(`${language["adsprot"].turnedOff}`)
        message.channel.send(turnedoffembed);
        return;
      }

    } else if (args[0] !== "off" || args[0] !== "on") {
      let incorrectUsageMessage = language["adsprot"].incorrectUsage;
      const incorrectUsage = incorrectUsageMessage.replace(
        "${prefix}",
        prefix
      );
      let incorrectembed = new Discord.RichEmbed()
      .setColor(`36393F`)
      .setDescription(`${incorrectUsage}`)
      message.channel.send(incorrectembed);
      return;
    }
  };
};

module.exports.help = {
  name: "adsprot"
};