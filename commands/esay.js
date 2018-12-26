const Discord = require('discord.js');
let language = require(`../messages/messages_en-US.json`);

module.exports.run = async (client, message, args) => {

  if((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== '151516555757223936'))) {
    message.channel.send(`${language["esay"].noPermission}`);
    return;
  }

  const sayMessage = args.join(" ");

  let servIcon = message.guild.iconURL;
  let esayEmbed = new Discord.RichEmbed()
    .setTitle(`Read Me`)
    .setColor(`RANDOM`)
    .setThumbnail(servIcon)
    .setDescription(`${sayMessage}`)
    .setTimestamp();

  const esayMessage = args.join(" ");
  message.delete().catch(O_o => {});

  message.channel.send(esayEmbed);
}
module.exports.help = {
  name: "esay"
};