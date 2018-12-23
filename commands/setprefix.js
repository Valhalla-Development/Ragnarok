const Discord = require("discord.js");
const fs = require("fs");
let prefixes = JSON.parse(fs.readFileSync("./Storage/prefixes.json", "utf8"));

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

  if((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== '151516555757223936')))
    return message.channel.send(`${language["setprefix"].noPermission}`);

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

  prefixes[message.guild.id] = {
    prefixes: args[0]
  };

  fs.writeFile(
    "./Storage/prefixes.json",
    JSON.stringify(prefixes, null, 2),
    err => {
      if (err) console.log(err);
    }
  );

  let prefixSetMessage = language["setprefix"].prefixSet;
  const prefixSet = prefixSetMessage.replace("${prefix}", args[0]);

  message.channel.send(`${prefixSet}`);
};

module.exports.help = {
  name: "setprefix"
};