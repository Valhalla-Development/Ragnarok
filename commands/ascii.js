const Discord = require("discord.js");
const fs = require("fs");
const ascii = require("ascii-art");

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  ascii.font(args.join(" "), "Doom", function(rendered) {
    rendered = rendered.trimRight();
    if((!message.member.hasPermission("EMBED_LINKS") && (message.author.id !== '151516555757223936')))
      return message.channel.send(`${language["ascii"].noPermission}`);
    if (rendered.length > 2000)
      return message.channel.send(`${language["ascii"].incorrectLength}`);
    message.channel.send(rendered, {
      code: "md"
    });
  });
};
module.exports.help = {
  name: "ascii"
};