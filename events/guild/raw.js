/* eslint-disable no-shadow */
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const { customAlphabet } = require('nanoid');
const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 7);

module.exports = async (bot, event) => {
  const eventType = event.t;
  const data = event.d;
  if (eventType === 'MESSAGE_DELETE') {
    if (data.user_id === bot.user.id) return;
    const getTicketEmbed = db.prepare(`SELECT * FROM ticketConfig WHERE guildid = ${data.guild_id}`).get();
    if (!getTicketEmbed || !getTicketEmbed.ticketembed) {
      return;
    }
    if (getTicketEmbed.ticketconfig === data.id) {
      db.prepare(`UPDATE ticketConfig SET ticketembed = '' WHERE guildid = ${data.guild_id}`).run();
    }
  }
  if (eventType === 'MESSAGE_REACTION_ADD') {
    const emoji = '📩';
    if (data.user_id === bot.user.id) return;
    const guild = bot.guilds.cache.find((guild) => guild.id === data.guild_id);
    const member = guild.members.cache.find((member) => member.id === data.user_id);
    const foundTicketConfig = db.prepare(`SELECT * FROM ticketconfig WHERE guildid = ${data.guild_id}`).get();
    if (!foundTicketConfig) {
      return;
    }
    if (foundTicketConfig.ticketembed === data.message_id) {
      const channel = guild.channels.cache.find((channel) => channel.id === data.channel_id);
      channel.messages.fetch(foundTicketConfig.ticketembed).then((msg) => {
        const reaction = msg.reactions.cache.get(data.emoji.name) || msg.reactions.cache.get(`${data.emoji.name}:${data.emoji.id}`);
        if (member.id !== bot.user.id) {
          if (emoji.includes(data.emoji.name)) {
            if (eventType === 'MESSAGE_REACTION_ADD') {
              reaction.users.remove(member.id);
              // "Support" role
              const suppRole = db.prepare(`SELECT role FROM ticketConfig WHERE guildid = ${guild.id}`).get();
              if (!guild.roles.cache.find((r) => r.name === 'Support Team') && !suppRole) {
                return;
              }
              // Make sure this is the user's only ticket.
              const foundTicket = db.prepare(`SELECT authorid FROM tickets WHERE guildid = ${guild.id} AND authorid = (@authorid)`);
              const checkTicketEx = db.prepare(`SELECT chanid FROM tickets WHERE guildid = ${guild.id} AND authorid = ${member.id}`).get();
              const roleCheckEx = db.prepare(`SELECT role FROM ticketConfig WHERE guildid = ${guild.id}`).get();
              if (checkTicketEx) {
                if (checkTicketEx.chanid == null) {
                  db.prepare(`DELETE FROM tickets WHERE guildid = ${guild.id} AND authorid = ${member.id}`).run();
                }
                if (!guild.channels.cache.find((channel) => channel.id === checkTicketEx.chanid)
                ) {
                  db.prepare(`DELETE FROM tickets WHERE guildid = ${guild.id} AND authorid = ${member.id}`).run();
                }
              }
              if (roleCheckEx) {
                if (!guild.roles.cache.find((role) => role.id === roleCheckEx.role)) {
                  const updateRole = db.prepare(`UPDATE ticketConfig SET role = (@role) WHERE guildid = ${guild.id}`);
                  updateRole.run({
                    role: null,
                  });
                }
              }
              if (foundTicket.get({ authorid: member.id })
              ) {
                return;
              }
              // Make Ticket
              const nickName = member.displayName;
              const id = db.prepare(`SELECT category FROM ticketConfig WHERE guildid = ${guild.id};`).get();
              const reason = 'No reason provided.';
              const randomString = nanoid();

              if (!id) {
                const newTicket = db.prepare('INSERT INTO tickets (guildid, ticketid, authorid, reason) values (@guildid, @ticketid, @authorid, @reason);');
                newTicket.run({
                  guildid: guild.id,
                  ticketid: randomString,
                  authorid: member.id,
                  reason,
                });
                // Create the channel with the name "ticket-" then the user's ID.
                const role = guild.roles.cache.find((x) => x.name === 'Support Team') || guild.roles.cache.find((r) => r.id === suppRole.role);
                if (!role) {
                  return;
                }
                const role2 = channel.guild.roles.everyone;
                guild.channels
                  .create(`ticket-${nickName}-${randomString}`, {
                    permissionOverwrites: [
                      {
                        id: role.id,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                      },
                      {
                        id: role2.id,
                        deny: 'VIEW_CHANNEL',
                      },
                      {
                        id: member.id,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                      },
                    ],
                  }).then((c) => {
                    const updateTicketChannel = db.prepare(`UPDATE tickets SET chanid = (@chanid) WHERE guildid = ${guild.id} AND ticketid = (@ticketid)`);
                    updateTicketChannel.run({
                      chanid: c.id,
                      ticketid: randomString,
                    });
                    // Send a message saying the ticket has been created.
                    const embed = new MessageEmbed()
                      .setColor('36393F')
                      .setTitle('New Ticket')
                      .setDescription(
                        `Hello \`${member.user.tag}\`! Welcome to our support ticketing system. Please hold tight and our administrators will be with you shortly. You can close this ticket at any time using \`-close\`.\n\n\nYou opened this ticket for the reason:\n\`\`\`${reason}\`\`\`\n**NOTE:** If you did not provide a reason, please send your reasoning for opening this ticket now.`,
                      );
                    c.send(embed);
                    // And display any errors in the console.
                    const logget = db
                      .prepare(
                        `SELECT log FROM ticketConfig WHERE guildid = ${
                          guild.id
                        };`,
                      )
                      .get();
                    if (!logget) {
                      return;
                    }
                    const logchan = guild.channels.cache.find(
                      (chan) => chan.id === logget.log,
                    );
                    if (!logchan) return;
                    const loggingembed = new MessageEmbed()
                      .setColor('36393F')
                      .setDescription(
                        `${member} has opened a new ticket \`#${c.name}\``,
                      );
                    logchan.send(loggingembed);
                  }).catch(console.error);
              } else {
                const newTicket = db.prepare(
                  'INSERT INTO tickets (guildid, ticketid, authorid, reason) values (@guildid, @ticketid, @authorid, @reason);',
                );
                newTicket.run({
                  guildid: guild.id,
                  ticketid: randomString,
                  authorid: member.id,
                  reason,
                });
                const ticategory = id.category;
                const role = guild.roles.cache.find((x) => x.name === 'Support Team') || guild.roles.cache.find((r) => r.id === suppRole.role);
                if (!role) {
                  return;
                }
                const role2 = channel.guild.roles.everyone;
                // Create the channel with the name "ticket-" then the user's ID.
                guild.channels
                  .create(`ticket-${nickName}-${randomString}`, {
                    permissionOverwrites: [
                      {
                        id: role.id,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                      },
                      {
                        id: role2.id,
                        deny: 'VIEW_CHANNEL',
                      },
                      {
                        id: member.id,
                        allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
                      },
                    ],
                  })
                  .then(async (c) => {
                    const updateTicketChannel = db.prepare(
                      `UPDATE tickets SET chanid = (@chanid) WHERE guildid = ${
                        guild.id
                      } AND ticketid = (@ticketid)`,
                    );
                    updateTicketChannel.run({
                      chanid: c.id,
                      ticketid: randomString,
                    });
                    await c.setParent(ticategory);
                    const embed = new MessageEmbed()
                      .setColor('36393F')
                      .setTitle('New Ticket')
                      .setDescription(
                        `Hello \`${
                          member.user.tag
                        }\`! Welcome to our support ticketing system. Please hold tight and our administrators will be with you shortly. \n\n\nYou opened this ticket for the reason:\n\`\`\`${reason}\`\`\`\n**NOTE:** If you did not provide a reason, please send your reasoning for opening this ticket now.`,
                      );
                    c.send(embed);
                    // And display any errors in the console.
                    const logget = db
                      .prepare(
                        `SELECT log FROM ticketConfig WHERE guildid = ${
                          guild.id
                        };`,
                      )
                      .get();
                    if (!logget) {
                      return;
                    }

                    const logchan = guild.channels.cache.find(
                      (chan) => chan.id === logget.log,
                    );
                    if (!logchan) return;
                    const loggingembed = new MessageEmbed()
                      .setColor('36393F')
                      .setDescription(
                        `${member} has opened a new ticket \`#${c.name}\``,
                      );
                    logchan.send(loggingembed);
                  })
                  .catch(console.error);
              }
            }
            reaction.users.remove(member.id);
          } else {
            reaction.users.remove(member.id);
          }
        }
      });
    }
  }
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
