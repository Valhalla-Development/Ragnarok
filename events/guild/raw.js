/* eslint-disable no-shadow */
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, event) => {

  const eventType = event.t;
  const data = event.d;
  if (eventType === 'MESSAGE_DELETE') {
    if (data.user_id === bot.user.id) return;
    const getRoleMenu = db
      .prepare(`SELECT * FROM rolemenu WHERE guildid=${data.guild_id}`)
      .get();
    if (!getRoleMenu || !getRoleMenu.activeRoleMenuID) {
      return;
    }
    if (getRoleMenu.activeRoleMenuID === data.id) {
      db.prepare(
        `UPDATE rolemenu SET activeRoleMenuID = '' WHERE guildid = ${
          data.guild_id
        }`,
      ).run();
    }
  }
  if (eventType === 'MESSAGE_REACTION_ADD') {
    const alphaEmoji = [
      '🇦',
      '🇧',
      '🇨',
      '🇩',
      '🇪',
      '🇫',
      '🇬',
      '🇭',
      '🇮',
      '🇯',
      '🇰',
      '🇱',
      '🇲',
      '🇳',
      '🇴',
      '🇵',
      '🇶',
      '🇷',
      '🇸',
      '🇹',
      '🇺',
      '🇻',
      '🇼',
      '🇽',
      '🇾',
      '🇿',
    ];
    if (data.user_id === bot.user.id) return;
    const guild = bot.guilds.cache.find((guild) => guild.id === data.guild_id);
    const member = guild.members.cache.find((member) => member.id === data.user_id);
    const foundRoleMenu = db
      .prepare(`SELECT * FROM rolemenu WHERE guildid=${data.guild_id}`)
      .get();
    if (!foundRoleMenu) {
      return;
    }
    if (foundRoleMenu.activeRoleMenuID === data.message_id) {
      const channel = guild.channels.cache.find(
        (channel) => channel.id === data.channel_id,
      );
      channel.messages.fetch(foundRoleMenu.activeRoleMenuID).then((msg) => {
        const roleArray = JSON.parse(foundRoleMenu.roleList);
        const reaction = msg.reactions.cache.get(data.emoji.name) || msg.reactions.cache.get(`${data.emoji.name}:${data.emoji.id}`);
        if (member.id !== bot.user.id) {
          if (alphaEmoji.includes(data.emoji.name)) {
            const roleIndex = alphaEmoji.indexOf(data.emoji.name);
            const addedRole = msg.guild.roles.cache.find(
              (r) => r.id === roleArray[roleIndex],
            );
            const memberRole = member.roles.cache.map((role) => role.id);

            if (
              !member.hasPermission('MANAGE_MESSAGES') && addedRole.permissions.has('MANAGE_MESSAGES')) {
              const getReactUser = reaction.users.map((react) => react.id);
              if (getReactUser.includes(member.id)) {
                reaction.users.remove(member.id);
              }
              return;
            } if (eventType === 'MESSAGE_REACTION_ADD') {
              if (memberRole.includes(roleArray[roleIndex])) {
                if (!msg.guild.roles.cache.find((r) => r.id === roleArray[roleIndex])) {
                  msg.channel
                    .send('Uh oh! The role you tried to add, no longer exists!')
                    .then((m) => m.delete({
                      timeout: 10000,
                    }));
                  return;
                }
                member.roles.remove(roleArray[roleIndex]);
                reaction.users.remove(member.id);
              } else {
                if (!msg.guild.roles.cache.find((r) => r.id === roleArray[roleIndex])) {
                  msg.channel
                    .send('Uh oh! The role you tried to add, no longer exists!')
                    .then((m) => m.delete({
                      timeout: 10000,
                    }));
                  return;
                }
                member.roles.add(roleArray[roleIndex]);
                reaction.users.remove(member.id);
              }
            }
          } else {
            reaction.users.remove(member.id);
          }
        }
      });
    }
  }
};
