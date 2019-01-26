const Discord = require("discord.js");
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

  if ((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== config.ownerID))) {
    message.channel.send(`${language["poll"].noPermission}`);
    return;
  }

  // Check for input
  if (!args[0]) {
    let incorrectUsageMessage = language["poll"].incorrectUsage;
    const incorrectUsage = incorrectUsageMessage.replace(
      "${prefix}",
      prefix
    );

    message.channel.send(`${incorrectUsage}`);
    return;
  }

  // Create Embed
  const embed = new Discord.RichEmbed()
    .setColor("#ffffff") //To change color do .setcolor("#fffff")
    .setFooter("React to Vote.")
    .setDescription(args.join(" "))
    .setTitle(`Poll Created By ${message.author.username}`);

  let msg = await message.channel
    .send(embed)
    .then(function (msg) {
      msg.react("✅");
      msg.react("❌"); // You can only add two reacts
      message.delete({
        timeout: 1000
      });
    })
    .catch(function (error) {
      console.log(error);
    });
};

module.exports.help = {
  // If stealing others source code, make sure to add this, also module. to line 3
  name: "poll"
};