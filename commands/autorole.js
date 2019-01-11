const Discord = require("discord.js");
const fs = require("fs");
let autorole = JSON.parse(fs.readFileSync("./Storage/autorole.json", "utf8"));
let prefixes = JSON.parse(fs.readFileSync("./Storage/prefixes.json", "utf8"));
const config = JSON.parse(
  fs.readFileSync("./Storage/config.json", "utf8")
);

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  if((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== config.ownerID)))
    return message.channel.send(`${language["autorole"].noPermission}`);

  if (!args[0]) {
    let incorrectUsageMessage = language["autorole"].incorrectUsage;
    const incorrectUsage = incorrectUsageMessage.replace(
      "${prefix}",
      prefixes[message.guild.id].prefixes
    );

    message.channel.send(`${incorrectUsage}`);
    return;
  }

  autorole[message.guild.id] = args[0];

  fs.writeFile(
    "./Storage/autorole.json",
    JSON.stringify(autorole, null, 2),
    err => {
      if (err) console.log(err);
    }
  );

  let autoroleSetMessage = language["autorole"].roleSet;
  const roleSet = autoroleSetMessage.replace("${autorole}", args[0]);

  message.channel.send(`${roleSet}`);
};

module.exports.help = {
  name: "autorole"
};