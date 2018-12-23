const Discord = require("discord.js");
const fs = require("fs");
let prefixes = JSON.parse(fs.readFileSync("./Storage/prefixes.json", "utf8"));

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  // perms checking

  if((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== '151516555757223936'))) {
    message.channel.send(`${language["autortoggle"].noPermission}`);
    return;
  }

  // reading json file

  const thing = JSON.parse(fs.readFileSync("./Storage/autorole.json", "utf8"));

  // if args is on

  if (args[0] === "on") {
    // if already on
    if (thing[message.guild.id]) {
      let alreadyOnMessage = language["autortoggle"].alreadyOn;
      const alreadyOn = alreadyOnMessage.replace(
        "${prefix}",
        prefixes[message.guild.id].prefixes
      );

      message.channel.send(`${alreadyOn}`);
      return;
    }

    // if not on
    if (!thing[message.guild.id]) {
      let notOnMessage = language["autortoggle"].notOn;
      const notOn = notOnMessage.replace(
        "${prefix}",
        prefixes[message.guild.id].prefixes
      );

      message.channel.send(`${notOn}`);
      return;
    }

    // if args = off
  } else if (args[0] === "off") {
    // if already off
    if (!thing[message.guild.id]) {
      let alreadyOffMessage = language["autortoggle"].alreadyOff;
      const alreadyOff = alreadyOffMessage.replace(
        "${prefix}",
        prefixes[message.guild.id].prefixes
      );

      message.channel.send(`${alreadyOff}`);
      return;
    }

    //if not already off
    message.channel.send(`${language["autortoggle"].turnedOff}`);
    delete thing[message.guild.id];
    fs.writeFile(
      "./Storage/autorole.json",
      JSON.stringify(thing, null, 2),
      err => {
        if (err) throw err;
      }
    );
  } else if (args[0] !== "off" || args[0] !== "on") {
    let incorrectUsageMessage = language["autortoggle"].incorrectUsage;
    const incorrectUsage = incorrectUsageMessage.replace(
      "${prefix}",
      prefixes[message.guild.id].prefixes
    );

    message.channel.send(`${incorrectUsage}`);
    return;
  }
};

module.exports.help = {
  name: "autortoggle"
};