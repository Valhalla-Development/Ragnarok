const Discord = require("discord.js");
const fs = require("fs");
const config = JSON.parse(
  fs.readFileSync("./Storage/config.json", "utf8")
);

module.exports.run = async (client, message, args) => {

  if((!message.member.hasPermission("CREATE_INSTANT_INVITE") && (message.author.id !== config.ownerID))) {
    message.channel.send(`${language["invite"].noPermission}`);
    return;
  }

  let cnt = message.content
  if (cnt !== " ") {
      message.delete(10) // ?
  };

  message.channel.createInvite({maxAge: 0}).then(invite => {
    let embed = new Discord.RichEmbed()
    .setColor('RANDOM')
    .setDescription(`:white_check_mark: **Permanent Invite Link**: ${invite}`);
    message.channel.send(embed);
  });
}

module.exports.help = {
    name: "ginvite"
  };