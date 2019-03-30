const Discord = require('discord.js');
const fs = require("fs");
const config = JSON.parse(
  fs.readFileSync("./Storage/config.json", "utf8")
);

let language = require(`../messages/messages_en-US.json`);

module.exports.run = async (client, message, args, color) => {

  if ((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== config.ownerID))) {
    message.channel.send(`${language.setwelcome.noPermission}`);
    return;
  }

  let exwelcome = new Discord.RichEmbed()
    .setTitle(`Title`)
    .setAuthor(`Author`)
    .setColor(3447003)
    .setDescription(`Description`)
    .setThumbnail(message.author.avatarURL);

  message.channel.send(exwelcome);
};
module.exports.help = {
  name: "exwelcome"
};