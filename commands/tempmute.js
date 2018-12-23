const Discord = require("discord.js");
const ms = require("ms");

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  if((!message.member.hasPermission("MANAGE_GUILD") && (message.author.id !== '151516555757223936')))
    return message.channel.send(`${language["unmute"].noPermission}`);
  if (message.content.split(" ").slice(2) < 1) return;
  const time = message.content.split(" ").slice(2);
  if (isNaN(time)) {
    message.channel.send(`${language["mute"].invalidDuration}`);
    return;
  }

  if (message.mentions.users.size < 1) {
    message.channel.send(`${language["mute"].noMention}`);
    return;
  }

  if (message.mentions.members.size < 1) {
    message.channel.send(`${language["mute"].noMention}`);
    return;
  }

  let user = message.mentions.users.first();
  let member = message.mentions.members.first();
  if (
    !message.guild
      .member(client.user)
      .hasPermission("MANAGE_ROLES_OR_PERMISSIONS")
  )
    return message.channel.send(`${language["mute"].noRolesPermission}`);

  // Mute command

  let mutedMessage = language["tempmute"].muted;
  let mutedDuration = mutedMessage.replace(
    "${duration}",
    ms(ms(`${time} minutes`), { long: true })
  );
  let muted = mutedDuration.replace("${user}", user.tag);

  message.channel.send(`${muted}`).then(() => {
    const mutedRole = message.guild.roles.find("name", "Muted");

    if (!mutedRole) {
      message.guild
        .createRole({
          name: "Muted",
          color: "#d3d3d3"
        })
        .then(() => {
          setTimeout(() => {
            const mutedRoleCreated = message.guild.roles.find("name", "Muted");
            message.guild.channels.forEach(channel => {
              channel.overwritePermissions(mutedRoleCreated.id, {
                SEND_MESSAGES: false
              });
            });
          }, 2000);
          setTimeout(() => {
            message.channel.send(
              "**`Muted` role created, executing mute command...**"
            );
          }, 1000);

          setTimeout(() => {
            const mutedRoleCreated = message.guild.roles.find("name", "Muted");
            member.addRole(mutedRoleCreated.id);
          }, 1000);

          setTimeout(() => {
            const mutedRoleCreated = message.guild.roles.find("name", "Muted");
            if (!member.roles.has(mutedRoleCreated.id)) {
              message.channel.send(`${language["mute"].noRoleAsigned}`);
              return;
            }
            member.removeRole(mutedRoleCreated.id);

            let unmutedMessage = language["mute"].unmuted;
            const unmuted = unmutedMessage.replace("${user}", user.tag);

            message.channel.send(`${unmuted}`);
          }, ms(`${time} minutes`, { long: true }));
        });
    } else if (mutedRole) {
      setTimeout(() => {
        member.addRole(mutedRole.id);
      }, 1000);
      setTimeout(() => {
        member.removeRole(mutedRole.id);

        let unmutedMessage = language["mute"].unmuted;
        const unmuted = unmutedMessage.replace("${user}", user.tag);

        message.channel.send(`${unmuted}`);
      }, ms(`${time} minutes`, { long: true }));
    }
  });
};

module.exports.help = {
  name: "tempmute"
};