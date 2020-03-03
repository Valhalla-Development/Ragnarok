const { ownerID } = require('../../storage/config.json');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'kick',
    usage: '${prefix}kick <@user>',
    category: 'moderation',
    description: 'Kicks a user from the guild',
    accessableby: 'Staff',
  },
  run: async (bot, message) => {
    message.delete();

    // no perms check

    if (
      !message.member.hasPermission('KICK_MEMBERS') && message.author.id !== ownerID) { return message.channel.send(`${language.kick.noAuthorPermission}`); }

    // no mention check

    if (message.mentions.users.size < 1) { return message.channel.send(`${language.kick.noMention}`); }

    const user = message.mentions.users.first();

    // perms checking again

    if (
      message.mentions.members.first().hasPermission('MANAGE_GUILD') || message.mentions.members.first().hasPermission('ADMINISTRATOR') || !message.mentions.members.first().kickable
    ) {
      const cannotKickMessage = language.kick.cannotKick;
      const cannotKick = cannotKickMessage.replace('${user}', user.id);

      message.channel.send(`${cannotKick}`);
      return;
    }

    // other checks

    if (user.id === bot.user.id) { return message.channel.send(`${language.kick.cannotKickBot}`); }
    if (user.id === message.author.id) { return message.channel.send(`${language.kick.cannotKickAuthor}`); }

    // message sending (await message)

    const kickingUserMessage = language.kick.kickingUser;
    const kickingUser = kickingUserMessage.replace('${user}', user.id);

    message.channel.send(`${kickingUser}`).then(() => {
      message.channel
        .awaitMessages((response) => response.author.id === message.author.id, {
          max: 1,
          time: 25000,
          errors: ['time'],
        })

      // collected

        .then((collected) => {
          message.mentions.members
            .first()
            .kick({
              reason: collected.first().content,
            })
            .then(() => {
              const kickedUserLine1Message = language.kick.kickedUserLine1;
              const kickedUser1U = kickedUserLine1Message.replace(
                '${user}',
                user.id,
              );
              const kickedUser1 = kickedUser1U.replace(
                '${guild}',
                message.guild.name,
              );

              const kickedUserLine2Message = language.kick.kickedUserLine2;
              const kickedUser2 = kickedUserLine2Message.replace(
                '${reason}',
                collected.first().content,
              );

              const kickedUserLine3Message = language.kick.kickedUserLine3;
              const kickedUser3 = kickedUserLine3Message.replace(
                '${moderator}',
                message.author.tag,
              );

              message.channel.send(
                `${kickedUser1}\n${kickedUser2}\n${kickedUser3}`,
              );
            });
        })

      // error catching
        .catch(() => {
          message.channel.send(`${language.kick.canceled}`);
        });
    });
  },
};
