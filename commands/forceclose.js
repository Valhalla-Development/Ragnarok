const Discord = require("discord.js");

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);


  message.delete();

  const modRole = message.guild.roles.find(r => ["Support Team"].includes(r.name))
  if (!modRole) {
    let nomodRole = new Discord.RichEmbed()
      .setColor(`36393F`)
      .setDescription(`${language["tickets"].nomodRole}`)
    message.channel.send(nomodRole);
    return;
  }

  if (!message.member.roles.has(modRole.id)) {
    let donthaveroleMessage = language["tickets"].donthaveRole;
    const role = donthaveroleMessage.replace(
      "${role}",
      modRole
    );
    let donthaveRole = new Discord.RichEmbed()
      .setColor(`36393F`)
      .setDescription(`${role}`)
    message.channel.send(donthaveRole);
    return;
  };

  if (!message.channel.name.startsWith(`ticket-`)) {
    let badChannel = new Discord.RichEmbed()
      .setColor(`36393F`)
      .setDescription(`${language["tickets"].wrongChannelClose}`)
    message.channel.send(badChannel);
    return;
  };

  if (message.channel.name.startsWith("ticket-")) {
    message.channel.delete();
  }
};

module.exports.help = {
  name: "forceclose"
}