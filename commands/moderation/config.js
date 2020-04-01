const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const { ownerID } = require('../../storage/config.json');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'config',
    usage: '${prefix}config',
    category: 'moderation',
    description: 'Displays available config commands',
    accessableby: 'Everyone',
  },
  run: async (bot, message, args, color) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    const prefixgrab = db
      .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
      .get(message.guild.id);

    const { prefix } = prefixgrab;

    // config help

    if (args[0] === undefined) {
      const undeembed = new MessageEmbed()
        .setAuthor('Ragnarok - Config', message.guild.iconURL())
        .setColor(color)
        .setDescription(`**Advert Protection**\n[${prefix}config adsprot <on/off>]() : Enables/Disabled advert protection\n**Autorole**\n[${prefix}config autorole <@role>]() : Sets the role users are given when they join the guild\n**Logging**\n[${prefix}config logging <#channel/off>]() : Sets/disables the logging channel\n**Prefix**\n[${prefix}config prefix <prefix>]() : Sets the guild prefix\n**Tickets**\n[${prefix}config ticket cat <cat name>]() : Sets the ticket category\n  [${prefix}config ticket log <#channel>](): Enables ticket logging\n  [${prefix}config ticket role <@role>](): Sets custom support role for ticket system\n**Welcome**\n[${prefix}config welcome channel <#channel>]() : Sets the welcome channel\n[${prefix}config welcome channel off]() : Disables the welcome message\n**Rolemenu**\n[${prefix}config rolemenu add <@role>]() : Sets the role menu roles\n  [${prefix}config rolemenu remove <@role>]() : Removes a role from rolemenu\n  [${prefix}config rolemenu clear]() : Removes all roles from rolemenu\n**Music**\n[${prefix}config music role <@role>]() : Sets the DJ role\n  [${prefix}config music role off]() : Disabled the DJ role\n**Membercount**\n[${prefix}config membercount <on/off>]() : Enables/Disables the member count module`);
      message.channel.send({
        embed: undeembed,
      });
      return;
    }

    // Membercount Command
    if (args[0] === 'membercount') {
      // perms checking

      if (
        !message.member.hasPermission('MANAGE_GUILD') && message.author.id !== ownerID) {
        const invalidpermsembed = new MessageEmbed()
          .setColor(color)
          .setDescription(`${language.membercount.noPermission}`);
        message.channel.send(invalidpermsembed);
        return;
      }

      // preparing count

      bot.getTable = db.prepare('SELECT * FROM membercount WHERE guildid = ?');
      let status;
      if (message.guild.id) {
        status = bot.getTable.get(message.guild.id);

        if (args[1] === 'on') {
          // if already on
          if (status) {
            const alreadyOnMessage = language.membercount.alreadyOn;
            const alreadyOn = alreadyOnMessage.replace('${prefix}', prefix);
            const alreadyonembed = new MessageEmbed()
              .setColor(color)
              .setDescription(`${alreadyOn}`);
            message.channel.send(alreadyonembed);
            return;
          }

          message.guild.channels.create('Member Count', {
            type: 'category', reason: 'member count category',
          }).then((a) => {
            a.setPosition(0);

            message.guild.channels.create(`Users: ${(message.guild.memberCount - message.guild.members.cache.filter((m) => m.user.bot).size).toLocaleString('en')}`, {
              type: 'voice',
              permissionOverwrites: [{
                id: message.channel.guild.roles.everyone.id,
                deny: 'CONNECT',
                allow: 'VIEW_CHANNEL',
              }],
              reason: 'user count channel',
            }).then((b) => {
              b.setParent(a);

              message.guild.channels.create(`Bots: ${message.guild.members.cache.filter((m) => m.user.bot).size}`, {
                type: 'voice',
                permissionOverwrites: [{
                  id: message.channel.guild.roles.everyone.id,
                  deny: 'CONNECT',
                  allow: 'VIEW_CHANNEL',
                }],
                reason: 'bot count channel',
              }).then((c) => {
                c.setParent(a);

                message.guild.channels.create(`Total: ${(message.guild.memberCount).toLocaleString('en')}`, {
                  type: 'voice',
                  permissionOverwrites: [{
                    id: message.channel.guild.roles.everyone.id,
                    deny: 'CONNECT',
                    allow: 'VIEW_CHANNEL',
                  }],
                  reason: 'total count channel',
                }).then((d) => {
                  d.setParent(a);

                  const insert = db.prepare(
                    'INSERT INTO membercount (guildid, status, channela, channelb, channelc) VALUES (@guildid, @status, @channela, @channelb, @channelc);',
                  );
                  insert.run({
                    guildid: `${message.guild.id}`,
                    status: 'on',
                    channela: b.id,
                    channelb: c.id,
                    channelc: d.id,
                  });
                });
              });
            });
          });

          const turnonembed = new MessageEmbed()
            .setColor(color)
            .setDescription(`${language.membercount.turnedOn}`);
          message.channel.send(turnonembed);


          // if args = off
        } else if (args[1] === 'off') {
          // if already off
          if (!status) {
            const alreadyOffMessage = language.membercount.alreadyOff;
            const alreadyOff = alreadyOffMessage.replace('${prefix}', prefix);
            const alreadyoffembed = new MessageEmbed()
              .setColor(color)
              .setDescription(`${alreadyOff}`);
            message.channel.send(alreadyoffembed);
            return;
          }

          const channelA = bot.channels.cache.find((a) => a.id === status.channela);
          const channelB = bot.channels.cache.find((b) => b.id === status.channelb);
          const channelC = bot.channels.cache.find((c) => c.id === status.channelc);

          const catA = message.guild.channels.cache.find((d) => d.name === 'Member Count');
          if (channelA) channelA.delete();
          if (channelB) channelB.delete();
          if (channelC) channelC.delete();
          if (catA) catA.delete();
          db.prepare('DELETE FROM membercount WHERE guildid = ?').run(
            message.guild.id,
          );
          const turnedoffembed = new MessageEmbed()
            .setColor(color)
            .setDescription(`${language.membercount.turnedOff}`);
          message.channel.send(turnedoffembed);
          return;
        } else if (args[1] !== 'off' || args[1] !== 'on') {
          const incorrectUsageMessage = language.membercount.incorrectUsage;
          const incorrectUsage = incorrectUsageMessage.replace(
            '${prefix}',
            prefix,
          );
          const incorrectembed = new MessageEmbed()
            .setColor(color)
            .setDescription(`${incorrectUsage}`);
          message.channel.send(incorrectembed);
          return;
        }
      }
    }

    // Rolemenu Command
    if (args[0] === 'rolemenu') {
      // Rolemenu Config
      if (
        !message.member.hasPermission('MANAGE_GUILD') && message.author.id !== ownerID) {
        const invalidpermsembed = new MessageEmbed()
          .setColor(color)
          .setDescription(`${language.autorole.noPermission}`);
        message.channel.send(invalidpermsembed);
        return;
      }

      if (args[1] === 'add') {
        const roleList = [];

        if (message.mentions.roles.size <= 0) {
          const errEmbed = new MessageEmbed()
            .setColor(color)
            .setDescription(
              ':x: You must mention a role to remove from the menu.',
            );

          message.channel.send(errEmbed);
          return;
        }

        const foundRoleMenu = db
          .prepare(`SELECT * FROM rolemenu WHERE guildid=${message.guild.id}`)
          .get();
        if (!foundRoleMenu) {
          message.mentions.roles.forEach((role) => {
            roleList.push(role.id);
          });
          const newRoleMenu = db.prepare(
            'INSERT INTO rolemenu (guildid, roleList) VALUES (@guildid, @roleList);',
          );
          newRoleMenu.run({
            guildid: `${message.guild.id}`,
            roleList: JSON.stringify(roleList),
          });
          const succEmbed = new MessageEmbed()
            .setColor(color)
            .setDescription(
              ':white_check_mark: Roles successfully set in the assignable role menu!',
            );
          message.channel.send(succEmbed);
        } else {
          const foundRoleList = JSON.parse(foundRoleMenu.roleList);
          message.mentions.roles.forEach((role) => {
            if (!foundRoleList.includes(role.id)) {
              foundRoleList.push(role.id);
            }
          });
          const updateRoleMenu = db.prepare(
            `UPDATE rolemenu SET roleList = (@roleList) WHERE guildid=${
              message.guild.id
            }`,
          );
          updateRoleMenu.run({
            roleList: JSON.stringify(foundRoleList),
          });
          const succEmbed = new MessageEmbed()
            .setColor(color)
            .setDescription(
              ':white_check_mark: Roles successfully set in the assignable role menu!',
            );
          message.channel.send(succEmbed);
        }
        return;
      }
      if (args[1] === 'remove') {
        if (message.mentions.roles.size <= 0) {
          const errEmbed = new MessageEmbed()
            .setColor(color)
            .setDescription(
              ':x: You must mention a role to remove from the menu.',
            );

          message.channel.send(errEmbed);
          return;
        }

        const mentions = message.mentions.roles.map((role) => role.id);

        const foundRoleMenu = db
          .prepare(`SELECT * FROM rolemenu WHERE guildid = ${message.guild.id}`)
          .get();
        const roleList = JSON.parse(foundRoleMenu.roleList);

        for (const role of mentions) {
          if (roleList.includes(role)) {
            const index = roleList.indexOf(role);
            roleList.splice(index, 1);
            const updateRoleList = db.prepare(
              'UPDATE rolemenu SET roleList = (@roleList) WHERE guildid = (@guildid)',
            );
            updateRoleList.run({
              guildid: `${message.guild.id}`,
              roleList: JSON.stringify(roleList),
            });
          }
        }

        const succEmbed = new MessageEmbed()
          .setColor(color)
          .setDescription(
            ':white_check_mark: Specified roles have successfully been cleared from the rolemenu!',
          );
        message.channel.send(succEmbed);
        return;
      }
      if (args[1] === 'clear') {
        db.prepare(
          `DELETE FROM rolemenu where guildid=${message.guild.id}`,
        ).run();
        const succEmbed = new MessageEmbed()
          .setColor(color)
          .setDescription(
            ':white_check_mark: All roles have successfully been cleared from the rolemenu!',
          );
        message.channel.send(succEmbed);
        return;
      }

      const incorrectUsageMessage = language.tickets.incorrectUsage;
      const incorrectUsage = incorrectUsageMessage.replace(
        '${prefix}',
        prefix,
      );
      const incorrectUsageembed = new MessageEmbed()
        .setColor(color)
        .setDescription(`${incorrectUsage}`);
      message.channel.send(incorrectUsageembed);
      return;
    }

    // adsprot
    if (args[0] === 'adsprot') {
      // perms checking

      if (
        !message.member.hasPermission('MANAGE_GUILD') && message.author.id !== ownerID) {
        const invalidpermsembed = new MessageEmbed()
          .setColor(color)
          .setDescription(`${language.adsprot.noPermission}`);
        message.channel.send(invalidpermsembed);
        return;
      }

      // preparing count

      bot.getTable = db.prepare('SELECT * FROM adsprot WHERE guildid = ?');
      let status;
      if (message.guild.id) {
        status = bot.getTable.get(message.guild.id);

        if (args[1] === 'on') {
          // if already on
          if (status) {
            const alreadyOnMessage = language.adsprot.alreadyOn;
            const alreadyOn = alreadyOnMessage.replace('${prefix}', prefix);
            const alreadyonembed = new MessageEmbed()
              .setColor(color)
              .setDescription(`${alreadyOn}`);
            message.channel.send(alreadyonembed);
            return;
          }

          const insert = db.prepare(
            'INSERT INTO adsprot (guildid, status) VALUES (@guildid, @status);',
          );
          insert.run({
            guildid: `${message.guild.id}`,
            status: 'on',
          });
          const turnonembed = new MessageEmbed()
            .setColor(color)
            .setDescription(`${language.adsprot.turnedOn}`);
          message.channel.send(turnonembed);


          // if args = off
        } else if (args[1] === 'off') {
          // if already off
          if (!status) {
            const alreadyOffMessage = language.adsprot.alreadyOff;
            const alreadyOff = alreadyOffMessage.replace('${prefix}', prefix);
            const alreadyoffembed = new MessageEmbed()
              .setColor(color)
              .setDescription(`${alreadyOff}`);
            message.channel.send(alreadyoffembed);
            return;
          }

          db.prepare('DELETE FROM adsprot WHERE guildid = ?').run(
            message.guild.id,
          );
          const turnedoffembed = new MessageEmbed()
            .setColor(color)
            .setDescription(`${language.adsprot.turnedOff}`);
          message.channel.send(turnedoffembed);
          return;
        } else if (args[1] !== 'off' || args[1] !== 'on') {
          const incorrectUsageMessage = language.adsprot.incorrectUsage;
          const incorrectUsage = incorrectUsageMessage.replace(
            '${prefix}',
            prefix,
          );
          const incorrectembed = new MessageEmbed()
            .setColor(color)
            .setDescription(`${incorrectUsage}`);
          message.channel.send(incorrectembed);
          return;
        }
      }
    }

    // autorole
    if (args[0] === 'autorole') {
      if (
        !message.member.hasPermission('MANAGE_GUILD') && message.author.id !== ownerID) {
        const invalidpermsembed = new MessageEmbed()
          .setColor(color)
          .setDescription(`${language.autorole.noPermission}`);
        message.channel.send(invalidpermsembed);
        return;
      }

      bot.getTable = db.prepare('SELECT * FROM autorole WHERE guildid = ?');
      let role;
      if (message.guild.id) {
        role = bot.getTable.get(message.guild.id);

        if (!args[1]) {
          const incorrectUsageMessage = language.autorole.incorrectUsage;
          const incorrectUsage = incorrectUsageMessage.replace(
            '${prefix}',
            prefix,
          );
          const incorrectUsageembed = new MessageEmbed()
            .setColor(color)
            .setDescription(`${incorrectUsage}`);
          message.channel.send(incorrectUsageembed);
          return;
        }
        if (args[1] === 'off') {
          db.prepare('DELETE FROM autorole WHERE guildid = ?').run(
            message.guild.id,
          );
          const turnoffembed = new MessageEmbed()
            .setColor(color)
            .setDescription(`${language.autorole.turnedOff}`);
          message.channel.send(turnoffembed);
          return;
        }
        if (!message.guild.roles.cache.JSONsome((r) => [`${args[1]}`].includes(r.name))) {
          return message.channel.send(
            ':x: **That role does not exist! Roles are case sensitive. (You do not tag the role, simply write the name of the role)**',
          );
        }
        if (role) {
          const update = db.prepare(
            'UPDATE autorole SET role = (@role) WHERE guildid = (@guildid);',
          );
          update.run({
            guildid: `${message.guild.id}`,
            role: `${args[1]}`,
          });
          const autoroleUpdateMessage = language.autorole.updateRole;
          const roleupdate = autoroleUpdateMessage.replace(
            '${autorole}',
            args[1],
          );
          const updatedembed = new MessageEmbed()
            .setColor(color)
            .setDescription(`${roleupdate}`);
          message.channel.send(updatedembed);
          return;
        }

        const insert = db.prepare(
          'INSERT INTO autorole (guildid, role) VALUES (@guildid, @role);',
        );
        insert.run({
          guildid: `${message.guild.id}`,
          role: `${args[1]}`,
        });
        const autoroleSetMessage = language.autorole.roleSet;
        const roleSet = autoroleSetMessage.replace('${autorole}', args[1]);
        const setembed = new MessageEmbed()
          .setColor(color)
          .setDescription(`${roleSet}`);
        message.channel.send(setembed);
        return;
      }
    }

    // logging

    if (args[0] === 'logging') {
      if (!message.member.guild.me.hasPermission('EMBED_LINKS') || (!message.member.guild.me.hasPermission('VIEW_AUDIT_LOG'))) {
        message.channel.send('I need the permissions `Embed Links` and `View Audit Log` for this command!');
        return;
      }
      if (
        !message.member.hasPermission('MANAGE_GUILD') && message.author.id !== ownerID) {
        return message.channel.send(`${language.logging.noPermission}`);
      }

      bot.getTable = db.prepare('SELECT * FROM logging WHERE guildid = ?');

      const lchan = message.mentions.channels.first();

      let status;
      if (message.guild.id) {
        status = bot.getTable.get(message.guild.id);

        if (args[1] === undefined) {
          message.channel.send(':x: | **Please mention a channel!**');
          return;
        }

        if (args[1] === 'off') {
          // to turn logging off
          if (!status) {
            message.channel.send(':x: | **Logging is already disabled!**');
            return;
          }

          message.channel.send(':white_check_mark: | **Logging disabled!**');
          db.prepare('DELETE FROM logging WHERE guildid = ?').run(
            message.guild.id,
          );
          return;
        }
        if (!lchan) {
          message.channel.send(`${language.logging.invalidChannel}`);
          return;
        }
        if (lchan.type === 'voice' || lchan.type === 'category') {
          message.channel.send(`${language.logging.invalidTextChannel}`);
          return;
        }
        if (!status) {
          const insert = db.prepare(
            'INSERT INTO logging (guildid, channel) VALUES (@guildid, @channel);',
          );
          insert.run({
            guildid: `${message.guild.id}`,
            channel: `${lchan.id}`,
          });
          message.channel.send(
            `:white_check_mark: | **Logging set to ${lchan}**`,
          );
          return;
        }

        const update = db.prepare(
          'UPDATE logging SET channel = (@channel) WHERE guildid = (@guildid);',
        );
        update.run({
          guildid: `${message.guild.id}`,
          channel: `${lchan.id}`,
        });
        message.channel.send(
          `:white_check_mark: | ** Logging updated to ${lchan}**`,
        );
        return;
      }
    }

    // ticket cat and log and role

    if (args[0] === 'ticket') {
      if (args[1] === 'cat') {
        if (
          !message.member.hasPermission('MANAGE_GUILD') && message.author.id !== ownerID) {
          return message.channel.send(`${language.tickets.noPermission}`);
        }

        bot.getTable = db.prepare(
          'SELECT category FROM ticketConfig WHERE guildid = ?',
        );

        const category = message.guild.channels.cache.find(
          (c) => c.name === args.slice(2).join(' ') && c.type === 'category',
        );

        let status;
        if (message.guild.id) {
          status = bot.getTable.get(message.guild.id);

          if (args[2] === undefined) {
            message.channel.send(
              ':x: | **Please type the name of the category!**',
            );
            return;
          }

          if (args[2] === 'off') {
            // to turn logging off
            if (!status) {
              message.channel.send(
                ':x: | **Ticket Category is already disabled!**',
              );
              return;
            }

            message.channel.send(
              ':white_check_mark: | **Ticket Category disabled!**',
            );
            db.prepare('UPDATE ticketConfig SET category = (@cat) WHERE guildid = (@guildid);').run({
              guildid: `${message.guild.id}`,
              cat: null,
            });
            return;
          }
          if (!category) {
            message.channel.send(`${language.tickets.invalidCategory}`);
            return;
          }
          if (!status) {
            const insert = db.prepare(
              'INSERT INTO ticketConfig (guildid, category) VALUES (@guildid, @category);',
            );
            insert.run({
              guildid: `${message.guild.id}`,
              category: `${category.id}`,
            });
            message.channel.send(
              `:white_check_mark: | **Ticket Category set to \`${
                category.name
              }\`**`,
            );
            return;
          }

          const update = db.prepare(
            'UPDATE ticketConfig SET category = (@category) WHERE guildid = (@guildid);',
          );
          update.run({
            guildid: `${message.guild.id}`,
            category: `${category.id}`,
          });
          message.channel.send(
            `:white_check_mark: | ** Ticket Category updated to \`${
              category.name
            }\`**`,
          );
          return;
        }
      } else if (args[1] === 'log') {
        if (
          !message.member.hasPermission('MANAGE_GUILD') && message.author.id !== ownerID) {
          return message.channel.send(`${language.tickets.noPermission}`);
        }

        bot.getTable = db.prepare(
          'SELECT log FROM ticketConfig WHERE guildid = ?',
        );

        const lchan = message.mentions.channels.first();

        let status;
        if (message.guild.id) {
          status = bot.getTable.get(message.guild.id);

          if (args[2] === undefined) {
            message.channel.send(':x: | **Please mention a channel!**');
            return;
          }

          if (args[2] === 'off') {
            // to turn logging off
            if (!status) {
              message.channel.send(
                ':x: | **Ticket Logging is already disabled!**',
              );
              return;
            }

            message.channel.send(
              ':white_check_mark: | **Ticket Logging disabled!**',
            );
            db.prepare(
              'UPDATE ticketConfig SET log = (@log) WHERE guildid = (@guildid)',
            ).run({
              guildid: message.guild.id,
              log: null,
            });
            return;
          }
          if (!lchan) {
            message.channel.send(`${language.tickets.invalidCategory}`);
            return;
          }
          if (!status) {
            const insert = db.prepare(
              'INSERT INTO ticketConfig (guildid, log) VALUES (@guildid, @channel);',
            );
            insert.run({
              guildid: `${message.guild.id}`,
              channel: `${lchan.id}`,
            });
            message.channel.send(
              `:white_check_mark: | **Ticket Logging set to ${lchan}**`,
            );
            return;
          }

          const update = db.prepare(
            'UPDATE ticketConfig SET log = (@log) WHERE guildid = (@guildid);',
          );
          update.run({
            guildid: `${message.guild.id}`,
            log: `${lchan.id}`,
          });
          message.channel.send(
            `:white_check_mark: | ** Ticket Logging updated to ${lchan}**`,
          );
          return;
        }
      } else if (args[1] === 'role') {
        if (
          !message.member.hasPermission('MANAGE_GUILD') && message.author.id !== ownerID) {
          return message.channel.send(`${language.tickets.noPermission}`);
        }

        bot.getTable = db.prepare(
          'SELECT role FROM ticketConfig WHERE guildid = ?',
        );
        const status = bot.getTable.get(message.guild.id);

        const suppRole = message.mentions.roles.first();

        if (message.mentions.roles.size <= 0 && args[2] !== 'off') {
          return message.channel.send(':x: | A role must be mentioned');
        }
        if (args[2] === 'off') {
          const update = db.prepare(
            'UPDATE ticketConfig SET role = (@role) WHERE guildid = (@guildid)',
          );
          update.run({
            guildid: `${message.guild.id}`,
            role: null,
          });
          message.channel.send(
            ':white_check_mark: | **Custom Support Role disabled!**',
          );
          return;
        }
        if (!status) {
          const update = db.prepare(
            'INSERT INTO ticketConfig (role, guildid) VALUES (@role, @guildid);',
          );
          update.run({
            guildid: `${message.guild.id}`,
            role: `${suppRole.id}`,
          });
          message.channel.send(
            `:white_check_mark: | **Support Role updated to ${suppRole}**`,
          );
          return;
        }

        const update = db.prepare(
          'UPDATE ticketConfig SET role = (@role) WHERE guildid = (@guildid);',
        );
        update.run({
          guildid: `${message.guild.id}`,
          role: `${suppRole.id}`,
        });
        message.channel.send(
          `:white_check_mark: | **Support Role updated to ${suppRole}**`,
        );
        return;
      }
    }

    // setprefix

    if (args[0] === 'prefix') {
      const talkedRecently = new Set();

      if (talkedRecently.has(message.author.id)) {
        message.channel.send(
          ':x: | **Wait 1 minute before changing the prefix again.**',
        );
      } else {
        talkedRecently.add(message.author.id);
        setTimeout(() => {
          talkedRecently.delete(message.author.id);
        }, 60000);
      }

      if (
        !message.member.hasPermission('MANAGE_GUILD') && message.author.id !== ownerID) {
        return message.channel.send(`${language.setprefix.noPermission}`);
      }

      bot.getTable = db.prepare('SELECT * FROM setprefix WHERE guildid = ?');
      let prefix;
      if (message.guild.id) {
        prefix = bot.getTable.get(message.guild.id);
      }

      if (args[1] === 'off') {
        const off = db.prepare(
          'UPDATE setprefix SET prefix = (\'-\') WHERE guildid = (@guildid);',
        );
        off.run({
          guildid: `${message.guild.id}`,
        });
        message.channel.send(
          ':white_check_mark: | **Custom prefix disabled!**',
        );
        return;
      }
      if (
        args[1] === '[' || args[1] === '{' || args[1] === ']' || args[1] === '}' || args[1] === ':'
      ) {
        message.channel.send(`${language.setprefix.blacklistedPrefix}`);
        return;
      }

      if (!args[1]) {
        return message.channel.send(`${language.setprefix.incorrectUsage}`);
      }

      if (prefix) {
        const update = db.prepare(
          'UPDATE setprefix SET prefix = (@prefix) WHERE guildid = (@guildid);',
        );
        update.run({
          guildid: `${message.guild.id}`,
          prefix: `${args[1]}`,
        });
        message.channel.send(':white_check_mark: | **Prefix updated!**');
        return;
      }

      const insert = db.prepare(
        'INSERT INTO setprefix (guildid, prefix) VALUES (@guildid, @prefix);',
      );
      insert.run({
        guildid: `${message.guild.id}`,
        prefix: `${args[1]}`,
      });
      message.channel.send(':white_check_mark: | **Prefix set!**');
      return;
    }

    // setwelcome

    if (args[0] === 'welcome') {
      if (args[1] === undefined) {
        const usage = new MessageEmbed()
          .setColor(color)
          .setDescription(
            `**USAGE:**\n\nTo set the welcome channel, the command is \`${prefix}config welcome channel <#channel>\`\nTo disable the welcome, use \`${prefix}config welcome channel off\``,
          );
        message.channel.send(usage);
        return;
      }
      if (args[1] === 'channel') {
        if (
          !message.member.hasPermission('MANAGE_GUILD') && message.author.id !== ownerID) {
          return message.channel.send(`${language.tickets.noPermission}`);
        }

        bot.getTable = db.prepare('SELECT * FROM setwelcome WHERE guildid = ?');

        const lchan = message.mentions.channels.first();

        let status;
        if (message.guild.id) {
          status = bot.getTable.get(message.guild.id);

          if (args[2] === undefined) {
            message.channel.send(':x: | **Please mention a channel!**');
            return;
          }

          if (args[2] === 'off') {
            // to turn logging off
            if (!status) {
              message.channel.send(
                ':x: | **Welcome channel is already disabled!**',
              );
            } else {
              message.channel.send(
                ':white_check_mark: | **Welcome channel disabled!**',
              );
              db.prepare(
                'DELETE FROM setwelcome WHERE guildid = (@guildid)',
              ).run({
                guildid: message.guild.id,
              });
            }
          } else if (!lchan) {
            message.channel.send(`${language.tickets.invalidCategory}`);
          } else if (!status) {
            const insert = db.prepare(
              'INSERT INTO setwelcome (guildid, channel) VALUES (@guildid, @channel);',
            );
            insert.run({
              guildid: `${message.guild.id}`,
              channel: `${lchan.id}`,
            });
            message.channel.send(
              `:white_check_mark: | **Welcome channel is now set to ${lchan}**`,
            );
          } else {
            const update = db.prepare(
              'UPDATE setwelcome SET channel = (@channel) WHERE guildid = (@guildid);',
            );
            update.run({
              guildid: `${message.guild.id}`,
              channel: `${lchan.id}`,
            });
            message.channel.send(
              `:white_check_mark: | **Welcome channel updated to ${lchan}**`,
            );
          }
        }
      }
    }
    // Music
    if (args[0] === 'music') {
      if (args[1] === undefined) {
        const usage = new MessageEmbed()
          .setColor(color)
          .setDescription(
            `**USAGE:**\n\nTo set the music role, the command is \`${prefix}config music role <@role>\`\nTo disable the role, use \`${prefix}config music role off\``,
          );
        message.channel.send(usage);
        return;
      }
      if (args[1] === 'role') {
        if (
          !message.member.hasPermission('MANAGE_GUILD') && message.author.id !== ownerID) {
          return message.channel.send(`${language.music.noPermission}`);
        }

        bot.getTable = db.prepare('SELECT * FROM music WHERE guildid = ?');

        let status;
        if (message.guild.id) {
          status = bot.getTable.get(message.guild.id);

          const djRole = message.mentions.roles.first();

          if (message.mentions.roles.size <= 0 && args[2] !== 'off') {
            return message.channel.send(':x: | A role must be mentioned');
          }
          if (args[2] === 'off') {
            const update = db.prepare(
              'UPDATE music SET role = (@role) WHERE guildid = (@guildid)',
            );
            update.run({
              guildid: `${message.guild.id}`,
              role: null,
            });
            message.channel.send(
              ':white_check_mark: | **Custom DJ Role disabled!**',
            );
            return;
          }

          if (!status) {
            const update = db.prepare(
              'INSERT INTO music (role, guildid) VALUES (@role, @guildid);',
            );
            update.run({
              guildid: `${message.guild.id}`,
              role: `${djRole.id}`,
            });
            message.channel.send(
              `:white_check_mark: | **DJ Role updated to ${djRole}**`,
            );
            return;
          }

          const update = db.prepare(
            'UPDATE music SET role = (@role) WHERE guildid = (@guildid);',
          );
          update.run({
            guildid: `${message.guild.id}`,
            role: `${djRole.id}`,
          });
          message.channel.send(
            `:white_check_mark: | **DJ Role updated to ${djRole}**`,
          );
          return;
        }
      }
    }
  },
};
