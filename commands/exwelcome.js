const Discord = require('discord.js');
let language = require(`../messages/messages_en-US.json`);

module.exports.run = async (client, message, args) => {

  if((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== '151516555757223936'))) {
    message.channel.send(`${language["setwelcome"].noPermission}`);
    return;
  }

  let exwelcome = new Discord.RichEmbed()
      .setTitle(`Title`)
      .setAuthor(`Author`)
      .setColor(3447003)
      .setDescription(`Description`)
      .setThumbnail(message.author.avatarURL);

  message.channel.send(exwelcome);
}
module.exports.help = {
  name: "exwelcome"
};