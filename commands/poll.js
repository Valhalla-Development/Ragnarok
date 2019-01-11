const Discord = require("discord.js");
const fs = require("fs");
let prefixes = JSON.parse(fs.readFileSync("./Storage/prefixes.json", "utf8"));
const config = JSON.parse(
  fs.readFileSync("./Storage/config.json", "utf8")
);

module.exports.run = async (bot, message, args, ops) => {
  let language = require(`../messages/messages_en-US.json`);

  if((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== config.ownerID))) {
    message.channel.send(`${language["poll"].noPermission}`);
    return;
  }

  // Check for input
  if (!args[0]) {
    let incorrectUsageMessage = language["poll"].incorrectUsage;
    const incorrectUsage = incorrectUsageMessage.replace(
      "${prefix}",
      prefixes[message.guild.id].prefixes
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
    .then(function(msg) {
      msg.react("✅");
      msg.react("❌"); // You can only add two reacts
      message.delete({ timeout: 1000 });
    })
    .catch(function(error) {
      console.log(error);
    });
};

module.exports.help = {
  // If stealing others source code, make sure to add this, also module. to line 3
  name: "poll"
};