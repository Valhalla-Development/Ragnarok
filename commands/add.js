const Discord = require("discord.js");

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

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



  let rUser = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
  if (!rUser) {
    let nouser = new Discord.RichEmbed()
      .setColor(`36393F`)
      .setDescription(`${language["tickets"].cantfindUser}`)
    message.channel.send(nouser);
    return;
  };
  let rreason = args.join(" ").slice(22);

  if (!message.channel.name.startsWith(`ticket-`)) {
    let badChannel = new Discord.RichEmbed()
      .setColor(`36393F`)
      .setDescription(`${language["tickets"].wrongChannel}`)
    message.channel.send(badChannel);
    return;
  }
  message.delete().catch(O_o => {});


  message.channel.overwritePermissions(rUser, {
    READ_MESSAGES: true,
    SEND_MESSAGES: true
  });

  let addedMessage = language["tickets"].added;
  const theuser = addedMessage.replace(
    "${user}",
    rUser
  );
  message.channel.send(`${theuser}`);

}

module.exports.help = {
  name: "add"
}