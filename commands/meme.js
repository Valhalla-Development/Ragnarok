const Discord = require("discord.js");
const meme = require("memejs");

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  meme(function (data) {
    const embed = new Discord.RichEmbed()
      .setTitle(data.title[0])
      .setColor(color)
      .setImage(data.url[0]);

    if (!message.channel.permissionsFor(message.guild.me).has("EMBED_LINKS")) {
      message.channel.send(`${language.meme.noEmbedPermission}`);
      return;
    }

    message.channel.send({
      embed
    });
  });
};

module.exports.help = {
  name: "meme"
};