const Discord = require("discord.js");
const SQLite = require('better-sqlite3')
const db = new SQLite('./Storage/db/db.sqlite');
const fs = require("fs");
const config = JSON.parse(
  fs.readFileSync("./Storage/config.json", "utf8")
);

module.exports.run = async (client, message, args, color) => {
  const talkedRecently = new Set();

  if (talkedRecently.has(message.author.id)) {
    message.channel.send(
      ":x: | **Wait 1 minute before changing the prefix again.**"
    );
  } else {
    talkedRecently.add(message.author.id);
    setTimeout(() => {
      talkedRecently.delete(message.author.id);
    }, 60000);
  }

  let language = require(`../messages/messages_en-US.json`);

  if((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== config.ownerID)))
    return message.channel.send(`${language["setprefix"].noPermission}`);

  client.getTable = db.prepare("SELECT * FROM setprefix WHERE guildid = ?");
  let prefix;
  if (message.guild.id) {
    prefix = client.getTable.get(message.guild.id);
  };

  if (args[0] === "off") {
    const off = db.prepare("UPDATE setprefix SET prefix = ('-') WHERE guildid = (@guildid);")
    off.run({
      guildid: `${message.guild.id}`,
  });
    message.channel.send(':white_check_mark: | **Custom prefix disabled!**')
    return;
  }
  if (
    args[0] === "[" ||
    args[0] === "{" ||
    args[0] === "]" ||
    args[0] === "}" ||
    args[0] === ":"
  ) {
    message.channel.send(`${language["setprefix"].blacklistedPrefix}`);
    return;
  }

  if (!args[0])
    return message.channel.send(`${language["setprefix"].incorrectUsage}`);

    if (prefix) {
    const update = db.prepare("UPDATE setprefix SET prefix = (@prefix) WHERE guildid = (@guildid);");
    update.run({
        guildid: `${message.guild.id}`,
        prefix: `${args[0]}`
    });
    message.channel.send(':white_check_mark: | **Prefix updated!**');
    return;
  } else {
    const insert = db.prepare("INSERT INTO setprefix (guildid, prefix) VALUES (@guildid, @prefix);");
    insert.run({
      guildid: `${message.guild.id}`,
      prefix: `${args[0]}`
    });
    message.channel.send(':white_check_mark: | **Prefix set!**');
    return;
  };
};

module.exports.help = {
  name: "setprefix"
};