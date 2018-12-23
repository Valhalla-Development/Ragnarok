const Discord = require("discord.js");

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  if (message.mentions.users.size < 1) {
    message.channel.send(`${language["unmute"].noMention}`).then(msg => {
      msg.delete(10000);
    });
    return;
  }

  if (message.mentions.members.size < 1) {
    message.channel.send(`${language["unmute"].noMention}`).then(msg => {
      msg.delete(10000);
    });
    return;
  }

  let user = message.mentions.users.first();
  let member = message.mentions.members.first();
  if((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== '151516555757223936'))) {
    message.channel.send(`${language["unmute"].noPermission}`).then(msg => {
      msg.delete(10000);
    });
    return;
  }

  const mutedRole = message.guild.roles.find("name", "Muted");

  if (!mutedRole) {
    message.channel.send(`${language["unmute"].noMutedRole}`).then(msg => {
      msg.delete(10000);
    });
  }

  if (message.member.roles.has(mutedRole.id)) {
    member.removeRole(mutedRole.id).then(() => {
      setTimeout(() => {
        let unmutedMessage = language["unmute"].unmuted;
        const unmuted = unmutedMessage.replace("${user}", user.tag);

        message.channel.send(`${unmuted}`);
      }, 1000);
    });
  } else {
    message.channel.send(`${language["unmute"].noRoleAsigned}`).then(msg => {
      msg.delete(10000);
    });
    return;
  }
};

module.exports.help = {
  name: "unmute"
};