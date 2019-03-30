const Discord = require('discord.js');
let language = require(`../messages/messages_en-US.json`);
const fs = require("fs");
const config = JSON.parse(
  fs.readFileSync("./Storage/config.json", "utf8")
);

module.exports.run = async (client, message, args, color) => {

  if ((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== config.ownerID))) {
    message.channel.send(`${language.esay.noPermission}`);
    return;
  }

  if(args[0] === undefined) {
    let noinEmb = new Discord.RichEmbed()
    .setColor('36393F')
    .setDescription(`${language.esay.noInput}`);
    message.channel.send(noinEmb);
    return;
  }

  const sayMessage = args.join(" ");

  let esayEmbed = new Discord.RichEmbed()
    .setColor(color)
    .setDescription(`${sayMessage}`);

  const esayMessage = args.join(" ");
  message.delete().catch(O_o => {});

  message.channel.send(esayEmbed);
};
module.exports.help = {
  name: "esay"
};