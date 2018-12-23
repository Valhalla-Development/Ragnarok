const Discord = require("discord.js");

module.exports.run = async (client, message, args, color) => {
  let language = require(`../messages/messages_en-US.json`);

  // no perms check

  if((!message.member.hasPermission("BAN_MEMBERS") && (message.author.id !== '151516555757223936')))
    return message.channel.send(`${language["ban"].noAuthorPermission}`);

  // no mention check

  if (message.mentions.users.size < 1)
    return message.channel.send(`${language["ban"].noMention}`);

  let user = message.mentions.users.first();

  // perms checking again

  if (
    message.mentions.members.first().hasPermission("MANAGE_GUILD") ||
    message.mentions.members.first().hasPermission("ADMINISTRATOR") ||
    !message.mentions.members.first().kickable
  ) {
    let cannotBanMessage = language["ban"].cannotBan;
    const cannotBan = cannotBanMessage.replace("${user}", user.id);

    message.channel.send(`${cannotBan}`);
    return;
  }

  // other checks

  if (user.id === client.user.id)
    return message.channel.send(`${language["ban"].cannotBanBot}`);
  if (user.id === message.author.id)
    return message.channel.send(`${language["ban"].cannotBanAuthor}`);

  // message sending (await message)

  let banningUserMessage = language["ban"].banningUser;
  const banningUser = banningUserMessage.replace("${user}", user.id);

  message.channel.send(`${banningUser}`).then(() => {
    message.channel
      .awaitMessages(response => response.author.id === message.author.id, {
        max: 1,
        time: 30000,
        errors: ["time"]
      })

      // collected

      .then(collected => {
        message.mentions.members
          .first()
          .ban({ reason: collected.first().content })
          .then(() => {
            let bannedUserLine1Message = language["ban"].bannedUserLine1;
            let bannedUser1U = bannedUserLine1Message.replace(
              "${user}",
              user.id
            );
            let bannedUser1 = bannedUser1U.replace(
              "${guild}",
              message.guild.name
            );

            let bannedUserLine2Message = language["ban"].bannedUserLine2;
            const bannedUser2 = bannedUserLine2Message.replace(
              "${reason}",
              collected.first().content
            );

            let bannedUserLine3Message = language["ban"].bannedUserLine3;
            const bannedUser3 = bannedUserLine3Message.replace(
              "${moderator}",
              message.author.tag
            );

            message.channel.send(
              `${bannedUser1}\n${bannedUser2}\n${bannedUser3}`
            );
            return;
          });
      })

      // error catching
      .catch(() => {
        message.channel.send(`${language["ban"].canceled}`);
      });
  });
};

module.exports.help = {
  name: "ban"
};