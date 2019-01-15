const SQLite = require('better-sqlite3')
const db = new SQLite('./Storage/db/db.sqlite');
const fs = require("fs");
const config = JSON.parse(
  fs.readFileSync("./Storage/config.json", "utf8")
);

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  const prefixgrab = db.prepare("SELECT prefix FROM setprefix WHERE guildid = ?").get(message.guild.id);

  let prefix = prefixgrab.prefix;

  // perms checking

  if ((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== config.ownerID))) {
    message.channel.send(`${language["profanity"].noPermission}`);
    return;
  };

  // preparing count

  client.getTable = db.prepare("SELECT * FROM profanity WHERE guildid = ?");
  let status;
  if (message.guild.id) {
    status = client.getTable.get(message.guild.id);

    if (args[0] === "on") {
      // if already on
      if (status) {
        let alreadyOnMessage = language["profanity"].alreadyOn;
        const alreadyOn = alreadyOnMessage.replace(
          "${prefix}",
          prefix
        );
        message.channel.send(`${alreadyOn}`);
        return;
      } else {
        const insert = db.prepare("INSERT INTO profanity (guildid, status) VALUES (@guildid, @status);");
        insert.run({
          guildid: `${message.guild.id}`,
          status: 'on'
        });
        message.channel.send(`${language["profanity"].turnedOn}`);
      };

      // if args = off
    } else if (args[0] === "off") {
      // if already off
      if (!status) {
        let alreadyOffMessage = language["profanity"].alreadyOff;
        const alreadyOff = alreadyOffMessage.replace(
          "${prefix}",
          prefix
        );
        message.channel.send(`${alreadyOff}`);
        return;
      } else {
        db.prepare("DELETE FROM profanity WHERE guildid = ?").run(message.guild.id);
        message.channel.send(`${language["profanity"].turnedOff}`);
        return;
      }

    } else if (args[0] !== "off" || args[0] !== "on") {
      let incorrectUsageMessage = language["profanity"].incorrectUsage;
      const incorrectUsage = incorrectUsageMessage.replace(
        "${prefix}",
        prefix
      );

      message.channel.send(`${incorrectUsage}`);
      return;
    }
  };
};

module.exports.help = {
  name: "profanity"
};