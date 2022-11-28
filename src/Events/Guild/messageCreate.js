/* eslint-disable max-depth */
/* eslint-disable consistent-return */
/* eslint-disable no-inline-comments */
/* eslint-disable no-mixed-operators */
import { EmbedBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ButtonStyle, OverwriteType, ChannelType } from 'discord.js';
import SQLite from 'better-sqlite3';
import urlRegexSafe from 'url-regex-safe';
import fetch from 'node-fetch';
import { customAlphabet } from 'nanoid';
import Event from '../../Structures/Event.js';

const db = new SQLite('./Storage/DB/db.sqlite');
const coinCooldown = new Set();
const coinCooldownSeconds = 60;
const xpCooldown = new Set();
const xpCooldownSeconds = 60;

const dadCooldown = new Set();
const dadCooldownSeconds = 60;

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 7);

export const EventF = class extends Event {
  async run(message) {
    const modMail = async () => {
      if (!message.guild) {
        if (message.author.bot) return;

        // Filter all guilds where the user is in
        const guilds = this.client.guilds.cache.filter((guild) => guild.members.cache.get(message.author.id));

        if (!guilds) {
          const embed = new EmbedBuilder().setColor('#A10000').addFields({
            name: `**${this.client.user.username} - Mod Mail**`,
            value: `**◎ Error:** You need to share a server with ${this.client.user} to use Mod Mail.`
          });
          message.reply({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          return;
        }

        const comCooldown = new Set();
        const comCooldownSeconds = 30;

        if (comCooldown.has(message.author.id)) {
          const embed = new EmbedBuilder().setColor('#A10000').addFields({
            name: `**${this.client.user.username} - Mod Mail**`,
            value: '**◎ Error:** Please do not spam the request.\nYou can canel your previous request by clicking the `Cancel` button.'
          });
          message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          return;
        }

        // Then filter which guilds have tickets enabled in the db
        const guildsWithTickets = guilds.filter((guild) => {
          // Fetch the row from the db where role is not null
          const row = db.prepare('SELECT * FROM ticketConfig WHERE guildid = ? AND role IS NOT NULL').get(guild.id);
          return row;
        });

        if (!guildsWithTickets.size) {
          const embed = new EmbedBuilder().setColor('#A10000').addFields({
            name: `**${this.client.user.username} - Mod Mail**`,
            value: `**◎ Error:** You need to share a server with ${this.client.user} that has tickets enabled, to use Mod Mail.`
          });
          message.reply({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          return;
        }

        // Map guilds by: name, id
        const guildsMap = guildsWithTickets.map((guild) => ({
          name: guild.name,
          id: guild.id
        }));

        // Sort guilds by: name in alphabetical order
        const sortedGuilds = guildsMap.sort((a, b) => {
          const nameA = a.name.toUpperCase();
          const nameB = b.name.toUpperCase();
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
          return 0;
        });

        // Set embed fields from new map to object and number them
        const embedFields = sortedGuilds.map((guild, index) => ({
          name: `${index + 1}. ${guild.name}`,
          value: `Guild ID: \`${guild.id}\``,
          inline: true
        }));

        // Map embedFields to buttons with numbers
        const buttons = embedFields.map((obj) => {
          const buttonMap = new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel(`${obj.name.slice(0, obj.name.indexOf('.'))}`)
            .setCustomId(`modMail-${obj.value.substring(obj.value.indexOf('`') + 1, obj.value.lastIndexOf('`'))}`);
          return buttonMap;
        });

        // Trim buttons to 24
        const trimmedButtons = buttons.slice(0, 24);

        const cancelButton = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Cancel').setCustomId('cancelModMail');
        trimmedButtons.push(cancelButton);

        // Split buttons into arrays of 5
        const splitButtons = [];
        for (let i = 0; i < trimmedButtons.length; i += 5) {
          splitButtons.push(trimmedButtons.slice(i, i + 5));
        }
        const finalButtonArray = splitButtons.splice(0, 5);

        // For each finalButtonArray, create a ActionRowBuilder()
        const actionRows = [];
        for (let i = 0; i < finalButtonArray.length; i++) {
          const actionRow = new ActionRowBuilder().addComponents(finalButtonArray[i]);
          actionRows.push(actionRow);
        }

        const embed = new EmbedBuilder()
          .setColor('#A10000')
          .setTitle('Select Server')
          .setDescription('Select which server you wish to send this message to. You can do so by clicking the corresponding button.')
          .addFields(...embedFields);

        if (!comCooldown.has(message.author.id)) {
          comCooldown.add(message.author.id);
        }
        setTimeout(() => {
          if (comCooldown.has(message.author.id)) {
            comCooldown.delete(message.author.id);
          }
        }, comCooldownSeconds * 1000);

        // Send embed
        try {
          const m = await message.reply({
            components: [...actionRows],
            embeds: [embed]
          });

          const filter = (but) => but.user.id !== this.client.user.id;

          const collector = m.createMessageComponentCollector({
            filter,
            time: 15000
          });

          collector.on('collect', async (b) => {
            if (b.customId === 'cancelModMail') {
              this.client.utils.deletableCheck(m, 0);

              const noGuild = new EmbedBuilder().setColor('#A10000').addFields({
                name: `**${this.client.user.username} - Mod Mail**`,
                value: '**◎ Success:** Your request has been cancelled.'
              });
              message.reply({ embeds: [noGuild] }).then((d) => this.client.utils.deletableCheck(d, 10000));
              return;
            }
            if (comCooldown.has(message.author.id)) {
              comCooldown.delete(message.author.id);
            }

            const trimGuild = b.customId.substring(b.customId.indexOf('-') + 1);
            const fetchGuild = this.client.guilds.cache.get(trimGuild);

            if (!fetchGuild) {
              this.client.utils.deletableCheck(m, 0);

              const noGuild = new EmbedBuilder().setColor('#A10000').addFields({
                name: `**${this.client.user.username} - Mod Mail**`,
                value: '**◎ Error:** I could not find the server you selected. Please try again.'
              });
              message.reply({ embeds: [noGuild] }).then((d) => this.client.utils.deletableCheck(d, 10000));
              return;
            }

            if (!fetchGuild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
              this.client.utils.deletableCheck(m, 0);

              const botPerm = new EmbedBuilder().setColor(this.client.utils.color(fetchGuild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Mod Mail**`,
                value: `**◎ Error:** It seems \`${fetchGuild.name}\` has removed the \`MANAGE_CHANNELS\` permission from me. I cannot function properly without it :cry:\nPlease report this within \`${fetchGuild}\` to a server moderator.`
              });
              message.reply({ embeds: [botPerm] }).then((d) => this.client.utils.deletableCheck(d, 10000));
              return;
            }

            const suppRole = db.prepare(`SELECT role FROM ticketConfig WHERE guildid = ${fetchGuild.id}`).get();

            // "Support" role
            if (!suppRole) {
              this.client.utils.deletableCheck(m, 0);

              const nomodRole = new EmbedBuilder().setColor(this.client.utils.color(fetchGuild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Mod Mail**`,
                value: `**◎ Error:** \`${fetchGuild.name}\` doesn't have a \`Support Team\` role made, so the ticket can't be opened.\nPlease report this within \`${fetchGuild}\` to a server moderator.`
              });
              message.reply({ embeds: [nomodRole] }).then((d) => this.client.utils.deletableCheck(d, 10000));
              return;
            }

            const fetchBlacklist = db.prepare(`SELECT blacklist FROM ticketConfig WHERE guildid=${fetchGuild.id}`).get();

            let foundBlacklist;

            if (!fetchBlacklist.blacklist) {
              foundBlacklist = [];
            } else {
              foundBlacklist = await JSON.parse(fetchBlacklist.blacklist);
            }

            if (foundBlacklist.includes(message.author.id)) {
              const embedA = new EmbedBuilder().setColor(this.client.utils.color(fetchGuild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Ticket**`,
                value: '**◎ Error:** You are blacklisted from creating tickets in this guild.'
              });
              message.channel.send({ ephemeral: true, embeds: [embedA] });
              return;
            }

            // Make sure this is the user's only ticket.
            const foundTicket = db.prepare(`SELECT authorid FROM tickets WHERE guildid = ${fetchGuild.id} AND authorid = (@authorid)`);
            const checkTicketEx = db.prepare(`SELECT chanid FROM tickets WHERE guildid = ${fetchGuild.id} AND authorid = ${message.author.id}`).get();
            const roleCheckEx = db.prepare(`SELECT role FROM ticketConfig WHERE guildid = ${fetchGuild.id}`).get();
            if (checkTicketEx) {
              if (checkTicketEx.chanid === null) {
                db.prepare(`DELETE FROM tickets WHERE guildid = ${fetchGuild.id} AND authorid = ${message.author.id}`).run();
              }
              if (!fetchGuild.channels.cache.find((channel) => channel.id === checkTicketEx.chanid)) {
                db.prepare(`DELETE FROM tickets WHERE guildid = ${fetchGuild.id} AND authorid = ${message.author.id}`).run();
              }
            }
            if (roleCheckEx) {
              if (!fetchGuild.roles.cache.find((role) => role.id === roleCheckEx.role)) {
                const updateRole = db.prepare(`UPDATE ticketConfig SET role = (@role) WHERE guildid = ${fetchGuild.id}`);
                updateRole.run({
                  role: null
                });
              }
            }
            if (foundTicket.get({ authorid: message.author.id })) {
              this.client.utils.deletableCheck(m, 0);

              const existTM = new EmbedBuilder().setColor(this.client.utils.color(fetchGuild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Mod Mail**`,
                value: `**◎ Error:** You already have a ticket open in \`${fetchGuild.name}\`!`
              });
              message.channel.send({ embeds: [existTM] }).then((d) => this.client.utils.deletableCheck(d, 10000));
              return;
            }

            const nickName = fetchGuild.members.cache.get(message.author.id).displayName;

            // Make Ticket
            const id = db.prepare(`SELECT category FROM ticketConfig WHERE guildid = ${fetchGuild.id};`).get();
            const reason = message.content;
            const randomString = nanoid();
            if (!id) {
              const newTicket = db.prepare(
                'INSERT INTO tickets (guildid, ticketid, authorid, reason) values (@guildid, @ticketid, @authorid, @reason);'
              );
              newTicket.run({
                guildid: fetchGuild.id,
                ticketid: randomString,
                authorid: message.author.id,
                reason
              });
              // Create the channel with the name "ticket-" then the user's ID.
              const role = fetchGuild.roles.cache.find((r) => r.id === suppRole.role);
              const role2 = fetchGuild.roles.everyone;
              fetchGuild.channels
                .create({
                  name: `ticket-${nickName}-${randomString}`,
                  type: ChannelType.GuildText,
                  permissionOverwrites: [
                    {
                      id: role.id,
                      allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                      type: OverwriteType.Role
                    },
                    {
                      id: role2.id,
                      deny: PermissionsBitField.Flags.ViewChannel,
                      type: OverwriteType.Role
                    },
                    {
                      id: message.author.id,
                      allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                      type: OverwriteType.Member
                    },
                    {
                      id: this.client.user.id,
                      allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                      type: OverwriteType.Member
                    }
                  ]
                })
                .then((c) => {
                  const updateTicketChannel = db.prepare(
                    `UPDATE tickets SET chanid = (@chanid) WHERE guildid = ${fetchGuild.id} AND ticketid = (@ticketid)`
                  );
                  updateTicketChannel.run({
                    chanid: c.id,
                    ticketid: randomString
                  });

                  const newTicketE = new EmbedBuilder().setColor(this.client.utils.color(fetchGuild.members.me.displayHexColor)).addFields({
                    name: `**${this.client.user.username} - New**`,
                    value: `**◎ Success:** Your ticket has been created in \`${fetchGuild.name}\`, <#${c.id}>.`
                  });
                  message.reply({ embeds: [newTicketE] });
                  const newTicketEm = new EmbedBuilder()
                    .setColor(this.client.utils.color(fetchGuild.members.me.displayHexColor))
                    .setTitle('New Ticket')
                    .setDescription(
                      `Welcome to our support system ${message.author}.\nPlease hold tight and a support member will be with you shortly.${
                        reason
                          ? `\n\n\nYou opened this ticket for the following reason:\n\`\`\`${reason}\`\`\``
                          : '\n\n\n**Please specify a reason for opening this ticket.**'
                      }`
                    );
                  c.send({ embeds: [newTicketEm] });
                  // And display any errors in the console.
                  const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${fetchGuild.id};`).get();
                  if (!logget) {
                    return;
                  }
                  const logchan = fetchGuild.channels.cache.find((chan) => chan.id === logget.log);
                  if (!logchan) return;

                  const openEpoch = Math.floor(new Date().getTime() / 1000);

                  const logEmbed = new EmbedBuilder()
                    .setColor(this.client.utils.color(fetchGuild.members.me.displayHexColor))
                    .setAuthor({
                      name: 'Ticket Opened',
                      iconURL: fetchGuild.iconURL({ extension: 'png' })
                    })
                    .addFields(
                      {
                        name: '<:ticketId:998229977004781618> **Ticket ID**',
                        value: `[${randomString}](${c.url})`,
                        inline: true
                      },
                      {
                        name: '<:ticketOpen:998229978267258881> **Opened By**',
                        value: `${message.author}`,
                        inline: true
                      },
                      {
                        name: '<:ticketCloseTime:998229975931048028> **Time Opened**',
                        value: `<t:${openEpoch}>`,
                        inline: true
                      },
                      {
                        name: '🖋️ **Reason**',
                        value: `${reason}`,
                        inline: true
                      }
                    );
                  logchan.send({ embeds: [logEmbed] });
                })
                .catch(console.error);
            } else {
              // Check how many channels are in the category
              const category = fetchGuild.channels.cache.find((chan) => chan.id === id.category);

              const categoryLength = category && category.children.cache.size ? category.children.cache.size : 0;

              let newId;
              // Check if the category has the max amount of channels
              if (categoryLength >= 50) {
                // Clone the category
                await category
                  .clone({
                    name: `${category.name}`,
                    reason: 'max channels per category reached'
                  })
                  .then((chn) => {
                    chn.setParent(category.parentId);
                    chn.setPosition(category.rawPosition + 1);

                    newId = chn.id;

                    // Update the database
                    const update = db.prepare('UPDATE ticketConfig SET category = (@category) WHERE guildid = (@guildid);');
                    update.run({
                      guildid: `${fetchGuild.id}`,
                      category: `${chn.id}`
                    });
                  });
              }

              const newTicket = db.prepare(
                'INSERT INTO tickets (guildid, ticketid, authorid, reason) values (@guildid, @ticketid, @authorid, @reason);'
              );
              newTicket.run({
                guildid: fetchGuild.id,
                ticketid: randomString,
                authorid: message.author.id,
                reason
              });

              let ticategory;
              if (fetchGuild.channels.cache.find((chan) => chan.id === id.category)) {
                ticategory = id.category;
              } else {
                const deleteCat = db.prepare(`UPDATE ticketConfig SET category = (@category) WHERE guildid = ${fetchGuild.id}`);
                deleteCat.run({
                  category: null
                });
              }

              const role = fetchGuild.roles.cache.find((r) => r.id === suppRole.role);
              const role2 = fetchGuild.roles.everyone;
              // Create the channel with the name "ticket-" then the user's ID.
              fetchGuild.channels
                .create({
                  name: `ticket-${nickName}-${randomString}`,
                  type: ChannelType.GuildText,
                  parent: newId || ticategory || null,
                  permissionOverwrites: [
                    {
                      id: role.id,
                      allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                      type: OverwriteType.Role
                    },
                    {
                      id: role2.id,
                      deny: PermissionsBitField.Flags.ViewChannel,
                      type: OverwriteType.Role
                    },
                    {
                      id: message.author.id,
                      allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                      type: OverwriteType.Member
                    },
                    {
                      id: this.client.user.id,
                      allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
                      type: OverwriteType.Member
                    }
                  ]
                })
                .then(async (c) => {
                  const updateTicketChannel = db.prepare(
                    `UPDATE tickets SET chanid = (@chanid) WHERE guildid = ${fetchGuild.id} AND ticketid = (@ticketid)`
                  );
                  updateTicketChannel.run({
                    chanid: c.id,
                    ticketid: randomString
                  });
                  // Send a message saying the ticket has been created.
                  const newTicketE = new EmbedBuilder().setColor(this.client.utils.color(fetchGuild.members.me.displayHexColor)).addFields({
                    name: `**${this.client.user.username} - New**`,
                    value: `**◎ Success:** Your ticket has been created in \`${fetchGuild.name}\`, <#${c.id}>.`
                  });
                  message.channel.send({ embeds: [newTicketE] });

                  const buttonClose = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('🔒 Close').setCustomId('closeTicket');

                  const buttonCloseReason = new ButtonBuilder()
                    .setStyle(ButtonStyle.Danger)
                    .setLabel('🔒 Close With Reason')
                    .setCustomId('closeTicketReason');

                  const row = new ActionRowBuilder().addComponents(buttonClose, buttonCloseReason);

                  const embedTicket = new EmbedBuilder()
                    .setColor(this.client.utils.color(fetchGuild.members.me.displayHexColor))
                    .setTitle('New Ticket')
                    .setDescription(
                      `Welcome to our support system ${message.author}.\nPlease hold tight and a support member will be with you shortly.${
                        reason
                          ? `\n\n\nYou opened this ticket for the following reason:\n\`\`\`${reason}\`\`\``
                          : '\n\n\n**Please specify a reason for opening this ticket.**'
                      }`
                    );
                  c.send({ components: [row], embeds: [embedTicket] });
                  // And display any errors in the console.
                  const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${fetchGuild.id};`).get();
                  if (!logget) {
                    return;
                  }

                  const logchan = fetchGuild.channels.cache.find((chan) => chan.id === logget.log);
                  if (!logchan) return;

                  const openEpoch = Math.floor(new Date().getTime() / 1000);

                  const logEmbed = new EmbedBuilder()
                    .setColor(this.client.utils.color(fetchGuild.members.me.displayHexColor))
                    .setAuthor({
                      name: 'Ticket Opened',
                      iconURL: fetchGuild.iconURL({ extension: 'png' })
                    })
                    .addFields(
                      {
                        name: '<:ticketId:998229977004781618> **Ticket ID**',
                        value: `[${randomString}](${c.url})`,
                        inline: true
                      },
                      {
                        name: '<:ticketOpen:998229978267258881> **Opened By**',
                        value: `${message.author}`,
                        inline: true
                      },
                      {
                        name: '<:ticketCloseTime:998229975931048028> **Time Opened**',
                        value: `<t:${openEpoch}>`,
                        inline: true
                      },
                      {
                        name: '🖋️ **Reason**',
                        value: `${reason}`,
                        inline: true
                      }
                    );
                  logchan.send({ embeds: [logEmbed] });
                })
                .catch(console.error);
            }
            this.client.utils.deletableCheck(m, 0);
          });

          collector.on('end', (_, reason) => {
            if (comCooldown.has(message.author.id)) {
              comCooldown.delete(message.author.id);
            }

            if (reason === 'time') {
              this.client.utils.deletableCheck(m, 0);
            }
          });
        } catch (e) {
          return console.log(e);
        }
      }
    };
    modMail();

    if (!message.guild || message.author.bot) return;

    const messageArray = message.content.split(' ');
    const dadArgs = messageArray.slice(1);
    const oargresult = dadArgs.join(' ');

    // AFK Module
    function afkModule(client) {
      const regex = /<@![0-9]{0,18}>/g;
      const found = message.content.match(regex);
      const pingCheck = db.prepare('SELECT * FROM afk WHERE guildid = ?').get(message.guild.id);
      const afkGrab = db.prepare('SELECT * FROM afk WHERE user = ? AND guildid = ?').get(message.author.id, message.guild.id);

      if (afkGrab) {
        // if (command && command.name === 'afk') return; // this wont work for /afk so figure it out hehe
        const deleteTicket = db.prepare(`DELETE FROM afk WHERE guildid = ${message.guild.id} AND user = (@user)`);
        deleteTicket.run({
          user: message.author.id
        });

        const embed = new EmbedBuilder().setColor(client.utils.color(message.guild.members.me.displayHexColor)).addFields({
          name: `**${client.user.username} - AFK**`,
          value: `**◎** ${message.author} is no longer AFK.`
        });
        message.channel.send({ embeds: [embed] });
        return;
      }

      if (found && pingCheck) {
        const afkCheck = db.prepare('SELECT * FROM afk WHERE user = ? AND guildid = ?').get(found[0].slice(3, 21), message.guild.id);
        if (afkCheck) {
          const error = new EmbedBuilder().setColor(client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${client.user.username} - AFK**`,
            value: `**◎** Please do not ping ${found}, they are currently AFK with the reason:\n\n${afkCheck.reason}`
          });
          message.channel.send({ embeds: [error] }).then((m) => client.utils.deletableCheck(m, 10000));
        }
      }
    }
    afkModule(this.client);

    // Easter Egg/s
    if (message.content.includes('(╯°□°）╯︵ ┻━┻')) {
      message.reply({
        content: 'Leave my table alone!\n┬─┬ ノ( ゜-゜ノ)'
      });
    }

    // Balance (balance)
    if (message.author.bot) return;
    let balance;
    balance = this.client.getBalance.get(`${message.author.id}-${message.guild.id}`);
    if (!balance) {
      const claimNewUserTime = new Date().getTime() + this.client.ecoPrices.newUserTime;

      balance = {
        id: `${message.author.id}-${message.guild.id}`,
        user: message.author.id,
        guild: message.guild.id,
        hourly: null,
        daily: null,
        weekly: null,
        monthly: null,
        stealcool: null,
        fishcool: null,
        farmcool: null,
        boosts: null,
        items: null,
        cash: 0,
        bank: 500,
        total: 500,
        claimNewUser: claimNewUserTime,
        farmPlot: null,
        dmHarvest: null,
        harvestedCrops: null,
        lottery: null
      };
    }
    const curBal = balance.cash;
    const curBan = balance.bank;
    const coinAmt = Math.floor(Math.random() * this.client.ecoPrices.maxPerM) + this.client.ecoPrices.minPerM;
    if (coinAmt) {
      if (!coinCooldown.has(message.author.id)) {
        balance.cash = curBal + coinAmt;
        balance.total = curBal + curBan + coinAmt;
        this.client.setBalance.run(balance);
        coinCooldown.add(message.author.id);
        setTimeout(() => {
          coinCooldown.delete(message.author.id);
        }, coinCooldownSeconds * 1000);
      }
    }

    // Scores (level)
    function levelSystem(grabClient) {
      // Level disabled check
      const levelDb = db.prepare(`SELECT status FROM level WHERE guildid = ${message.guild.id};`).get();
      let score;
      if (message.guild) {
        score = grabClient.getScore.get(message.author.id, message.guild.id);
        if (!score) {
          score = {
            id: `${message.guild.id}-${message.author.id}`,
            user: message.author.id,
            guild: message.guild.id,
            points: 0,
            level: 0,
            country: null,
            image: null
          };
        }
        const xpAdd = Math.floor(Math.random() * (25 - 15 + 1) + 15); // Random amount between 15 - 25
        const curxp = score.points; // Current points
        const curlvl = score.level; // Current level
        const levelNoMinus = score.level + 1;
        const nxtLvl = (5 / 6) * levelNoMinus * (2 * levelNoMinus * levelNoMinus + 27 * levelNoMinus + 91);
        score.points = curxp + xpAdd;
        if (nxtLvl <= score.points) {
          score.level = curlvl + 1;
          if (score.level === 0) return;
          if (xpCooldown.has(message.author.id)) return;
          const lvlup = new EmbedBuilder()
            .setAuthor({ name: `Congratulations ${message.author.username}` })
            .setThumbnail('https://ya-webdesign.com/images250_/surprised-patrick-png-7.png')
            .setColor(grabClient.utils.color(message.guild.members.me.displayHexColor))
            .setDescription(`**You have leveled up!**\nNew Level: \`${curlvl + 1}\``);

          if (!levelDb) {
            if (message.channel.permissionsFor(message.guild.members.me).has(PermissionsBitField.Flags.EmbedLinks)) {
              message.channel.send({ embeds: [lvlup] }).then((m) => grabClient.utils.deletableCheck(m, 10000));
            }
          }
        }
      }
      if (!xpCooldown.has(message.author.id)) {
        xpCooldown.add(message.author.id);
        grabClient.setScore.run(score);
        setTimeout(() => {
          xpCooldown.delete(message.author.id);
        }, xpCooldownSeconds * 1000);
      }
    }
    levelSystem(this.client);

    // Dad Bot
    function dadBot() {
      const dadbot = db.prepare(`SELECT * FROM dadbot WHERE guildid = ${message.guild.id};`).get();
      if (!dadbot) {
        return;
      }

      if (dadCooldown.has(message.author.id)) return;
      if (message.content.toLowerCase().startsWith('im ') || message.content.toLowerCase().startsWith('i\'m ')) {
        if (message.content.length > 10) {
          return;
        }
        if (messageArray.length === 1) {
          return;
        }
        const matches = urlRegexSafe({ strict: false }).test(message.content.toLowerCase());

        if (matches) {
          message.channel.send({
            files: ['./Storage/Images/dadNo.png']
          });
        } else if (message.content.toLowerCase().startsWith('im dad') || message.content.toLowerCase().startsWith('i\'m dad')) {
          message.channel.send({ content: 'No, I\'m Dad!' });
        } else if (message.content.toLowerCase().includes('@everyone') || message.content.toLowerCase().includes('@here')) {
          message.reply({ content: '<:pepebruh:987742251297931274>' });
        } else {
          message.channel.send({ content: `Hi ${oargresult}, I'm Dad!` });
        }
      }
      if (!dadCooldown.has(message.author.id)) {
        dadCooldown.add(message.author.id);
        setTimeout(() => {
          dadCooldown.delete(message.author.id);
        }, dadCooldownSeconds * 1000);
      }
    }
    dadBot();

    async function antiScam(grabClient) {
      const antiscam = db.prepare('SELECT count(*) FROM antiscam WHERE guildid = ?').get(message.guild.id);
      if (antiscam['count(*)']) {
        if (!message.member.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          const npPerms = new EmbedBuilder().setColor(grabClient.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${grabClient.user.username} - Anti Scam**`,
            value: '**◎ Error:** I do not have the `MANAGE_MESSAGES` permissions. Disabling Anti Scam.'
          });
          message.channel.send({ embeds: [npPerms] }).then((m) => grabClient.utils.messageDelete(m, 0));
          db.prepare('DELETE FROM antiscam WHERE guildid = ?').run(message.guild.id);
          return;
        }

        const reasons = [];

        // Scam Links
        // const rawLinks = await fetch('https://spen.tk/api/v1/links');
        // const linksJson = await rawLinks.json();
        // if (linksJson.status === 200) {
        const linksContent = grabClient.stenLinks;
        if (linksContent.some((link) => message.content.toLowerCase().includes(link))) reasons.push('Malicious Link');
        // }

        /* const rawTerms = await fetch(`https://spen.tk/api/v1/isMaliciousTerm/?text=${message.content.toLowerCase()}`);
        const termsJson = await rawTerms.json();
        if (termsJson.status === 200 && termsJson.hasMatch === true) reasons.push('Malicious Term'); */

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          if (reasons.length) {
            if (message.member.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
              grabClient.utils.messageDelete(message, 0);
              message.channel.send(`**◎ Your message contains: \`${reasons.join(', ')}\` and it was deleted, ${message.author}**`).then((msg) => {
                grabClient.utils.deletableCheck(msg, 5000);
              });
            }
          }
        }
      }
    }
    antiScam(this.client);

    // Ads protection checks
    function adsProt(grabClient) {
      const adsprot = db.prepare('SELECT count(*) FROM adsprot WHERE guildid = ?').get(message.guild.id);
      if (adsprot['count(*)']) {
        if (!message.member.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          const npPerms = new EmbedBuilder().setColor(grabClient.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${grabClient.user.username} - Ads Protection**`,
            value: '**◎ Error:** I do not have the `MANAGE_MESSAGES` permissions. Disabling Ads Protection.'
          });
          message.channel.send({ embeds: [npPerms] }).then((m) => grabClient.utils.messageDelete(m, 0));
          db.prepare('DELETE FROM adsprot WHERE guildid = ?').run(message.guild.id);
          return;
        }

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages) && !message.channel.name.startsWith('ticket-')) {
          const matches = urlRegexSafe({ strict: false }).test(message.content.toLowerCase());
          if (matches) {
            if (message.member.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
              grabClient.utils.messageDelete(message, 0);
              message.channel.send(`**◎ Your message contained a link and it was deleted, ${message.author}**`).then((msg) => {
                grabClient.utils.deletableCheck(msg, 5000);
              });
            }
          }
        }
      }
    }
    adsProt(this.client);

    // Link Mention Function
    async function linkTag(grabClient) {
      const mainReg = /https:\/\/discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,19}/;
      const ptbReg = /https:\/\/ptb\.discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,19}/;
      const disReg = /https:\/\/discord\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,19}/;
      const ptReg = /https:\/\/ptb\.discord\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,19}/;
      const caReg = /https:\/\/canary\.discord\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,19}/;
      const canApReg = /https:\/\/canary\.discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,19}/;

      const mainCheck = mainReg.test(message.content.toLowerCase());
      const ptbCheck = ptbReg.test(message.content.toLowerCase());
      const disCheck = disReg.test(message.content.toLowerCase());
      const ptbdisCheck = ptReg.test(message.content.toLowerCase());
      const canCheck = caReg.test(message.content.toLowerCase());
      const canACheck = canApReg.test(message.content.toLowerCase());

      const exec =
        mainReg.exec(message.content.toLowerCase()) ||
        ptbReg.exec(message.content.toLowerCase()) ||
        disReg.exec(message.content.toLowerCase()) ||
        ptReg.exec(message.content.toLowerCase()) ||
        caReg.exec(message.content.toLowerCase()) ||
        canApReg.exec(message.content.toLowerCase());

      let guildID;
      let channelID;
      let messageID;
      let URL;

      if (mainCheck || ptbCheck || disCheck || ptbdisCheck || canCheck || canACheck) {
        const mainGlob = /https:\/\/discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,19}/g;
        const ptbGlob = /https:\/\/ptb\.discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,19}/g;
        const disGlob = /https:\/\/discord\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,19}/g;
        const ptGlob = /https:\/\/ptb\.discord\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,19}/g;
        const caGlob = /https:\/\/canary\.discord\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,19}/g;
        const canAGlob = /https:\/\/canary\.discordapp\.com\/channels\/\d{1,18}\/\d{1,18}\/\d{1,19}/g;

        let lengthMain;
        let lengthPtb;

        if (mainGlob.test(message.content.toLowerCase()) === true) {
          lengthMain = message.content.toLowerCase().match(mainGlob).length;
        } else {
          lengthMain = 0;
        }
        if (ptbGlob.test(message.content.toLowerCase()) === true) {
          lengthPtb = message.content.toLowerCase().match(ptbGlob).length;
        } else {
          lengthPtb = 0;
        }
        if (disGlob.test(message.content.toLowerCase()) === true) {
          lengthMain = message.content.toLowerCase().match(disGlob).length;
        } else {
          lengthMain = 0;
        }
        if (ptGlob.test(message.content.toLowerCase()) === true) {
          lengthPtb = message.content.toLowerCase().match(ptGlob).length;
        } else {
          lengthPtb = 0;
        }
        if (caGlob.test(message.content.toLowerCase()) === true) {
          lengthMain = message.content.toLowerCase().match(caGlob).length;
        } else {
          lengthMain = 0;
        }
        if (canAGlob.test(message.content.toLowerCase()) === true) {
          lengthPtb = message.content.toLowerCase().match(canAGlob).length;
        } else {
          lengthPtb = 0;
        }

        if (lengthMain + lengthPtb > 1) return;

        const mesLink = exec[0];
        if (mainCheck) {
          guildID = mesLink.substring(32, mesLink.length - 39);
          channelID = mesLink.substring(51, mesLink.length - 20);
          messageID = mesLink.substring(70);
          URL = `https://discordapp.com/channels/${guildID}/${channelID}/${messageID}`;
        } else if (ptbCheck) {
          guildID = mesLink.substring(36, mesLink.length - 39);
          channelID = mesLink.substring(55, mesLink.length - 20);
          messageID = mesLink.substring(74);
          URL = `https://ptb.discordapp.com/channels/${guildID}/${channelID}/${messageID}`;
        } else if (disCheck) {
          guildID = mesLink.substring(29, mesLink.length - 39);
          channelID = mesLink.substring(48, mesLink.length - 20);
          messageID = mesLink.substring(67);
          URL = `https://discord.com/channels/${guildID}/${channelID}/${messageID}`;
        } else if (ptbdisCheck) {
          guildID = mesLink.substring(33, mesLink.length - 39);
          channelID = mesLink.substring(52, mesLink.length - 20);
          messageID = mesLink.substring(71);
          URL = `https://ptb.discord.com/channels/${guildID}/${channelID}/${messageID}`;
        } else if (canCheck) {
          guildID = mesLink.substring(36, mesLink.length - 39);
          channelID = mesLink.substring(55, mesLink.length - 20);
          messageID = mesLink.substring(74);
          URL = `https://canary.discord.com/channels/${guildID}/${channelID}/${messageID}`;
        } else if (canACheck) {
          guildID = mesLink.substring(39, mesLink.length - 39);
          channelID = mesLink.substring(58, mesLink.length - 20);
          messageID = mesLink.substring(77);
          URL = `https://canary.discordapp.com/channels/${guildID}/${channelID}/${messageID}`;
        }

        if (!guildID) {
          return;
        }
        if (!channelID) {
          return;
        }
        if (!messageID) {
          return;
        }

        const embed = new EmbedBuilder()
          .setAuthor({
            name: `${message.author.username}`,
            iconURL: message.author.displayAvatarURL({ extension: 'png' })
          })
          .setColor(grabClient.utils.color(message.guild.members.me.displayHexColor))
          .setFooter({ text: `Requested by ${message.author.username}` })
          .setTimestamp();
        if (message.guild.id === guildID) {
          const findGuild = grabClient.guilds.cache.get(guildID);
          const findChannel = findGuild.channels.cache.get(channelID);
          const validExtensions = ['gif', 'png', 'jpeg', 'jpg'];

          await findChannel.messages
            .fetch({ message: messageID })
            .then((res) => {
              if (res) {
                // Fetch the message author
                const user = grabClient.users.cache.find((a) => a.id === res.author.id);

                embed.setAuthor({
                  name: `${user && user.username ? user.username : message.author.username}`,
                  iconURL:
                    user && user.displayAvatarURL
                      ? user.displayAvatarURL({ extension: 'png' })
                      : message.author.displayAvatarURL({ extension: 'png' })
                });

                if (res.embeds[0]) {
                  // fail bruh
                  if (res.embeds[0].url) {
                    const fileExtension = res.embeds[0].url.substring(res.embeds[0].url.lastIndexOf('.') + 1);
                    if (validExtensions.includes(fileExtension)) {
                      embed.setDescription(
                        `**◎ [Message Link](${URL}) to** ${res.channel}\n${res.content.length > 1048 ? res.content.substring(0, 1048) : res.content}`
                      );
                      embed.setImage(res.embeds[0].url);
                      message.channel.send({ embeds: [embed] });
                    }
                    return;
                  }
                  return;
                }

                const attachmentCheck = res.attachments.first();
                if (attachmentCheck && res.content !== '') {
                  const attachmentUrl = res.attachments.first().url;
                  const fileExtension = attachmentUrl.substring(attachmentUrl.lastIndexOf('.') + 1);
                  if (!validExtensions.includes(fileExtension)) {
                    embed.setDescription(`**◎ [Message Link](${URL}) to** ${res.channel}\n${res.content.substring(0, 1048)}`);
                    return;
                  }
                  embed.setDescription(`**◎ [Message Link](${URL}) to** ${res.channel}\n${res.content.substring(0, 1048)}`);
                  embed.setImage(attachmentUrl);
                  message.channel.send({ embeds: [embed] });
                  return;
                }
                if (attachmentCheck) {
                  const attachmentUrl = res.attachments.first().url;
                  const fileExtension = attachmentUrl.substring(attachmentUrl.lastIndexOf('.') + 1);
                  if (validExtensions.includes(fileExtension)) {
                    embed.setDescription(`**◎ [Message Link](${URL}) to** ${res.channel}`);
                    embed.setImage(attachmentUrl);
                    message.channel.send({ embeds: [embed] });
                  }
                } else {
                  embed.setDescription(`**◎ [Message Link](${URL}) to** ${res.channel}\n${res.content.substring(0, 1048)}`);
                  message.channel.send({ embeds: [embed] });
                }
              }
            })
            .catch((e) => {
              console.error(e);
            });
        }
      }
    }
    linkTag(this.client);

    async function chatBot(grabClient) {
      const apiArgs = message.content.slice().trim().split(/ +/g);
      apiArgs.splice(0, 1);

      if (message.guild) {
        if (message.author.bot) return;
        if (message.content.startsWith(`<@${grabClient.user.id}>`) || message.content.startsWith(`<@!${grabClient.user.id}>`)) {
          if (!apiArgs.length) return;

          message.channel.sendTyping();

          // Old thing
          // `https://api.affiliateplus.xyz/api/chatbot?message=${apiArgs.join('%20')}&botname=${this.client.user.username}&ownername=Ragnar&user=${message.author.id}`;

          const indexOfSpace = message.content.indexOf(' ');
          const trimmed = message.content.substring(indexOfSpace + 1);

          try {
            await fetch(`http://api.brainshop.ai/get?bid=169096&key=4EniC9NJwnodt29j&uid=${message.author.id}&msg=${encodeURIComponent(trimmed)}`)
              .then((res) => res.json())
              .then((json) =>
                message.reply({
                  content: json.cnt,
                  allowedMentions: { repliedUser: false }
                })
              );
          } catch {
            message.reply({
              content: 'I am unable to connect to the chat API. Please try again later.'
            });
          }
        }
      }
    }
    chatBot(this.client);

    const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
    if (!prefixgrab) return;
    const prefixcommand = prefixgrab.prefix;
    // eslint-disable-next-line no-unused-vars
    const [cmd, ...args] = message.content.slice(prefixcommand.length).trim().split(/ +/g);

    const commandArray = [
      'balance',
      'bal',
      'coins',
      'money',
      'baltop',
      'rich',
      'bank',
      'dep',
      'deposit',
      'claim',
      'rewards',
      'claimable',
      'reward',
      'collect',
      'c',
      'coinflip',
      'cf',
      'farm',
      'fish',
      'give',
      'pay',
      'harvest',
      'items',
      'inv',
      'plant',
      'rob',
      'steal',
      'rockpaperscissors',
      'rps',
      'shop',
      'upgrade',
      'boosts',
      'store',
      'withdraw',
      'afk',
      'airreps',
      'avatar',
      'pfp',
      'bigemote',
      'birthday',
      'bday',
      'calc',
      'math',
      'crypto',
      'cryptocurrency',
      'doctorwho',
      'drwho',
      'hastebin',
      'haste',
      'hb',
      'hug',
      'leader',
      'leaderboard',
      'level',
      'rank',
      'meme',
      'funny',
      'npm',
      'trakt',
      'movie',
      'show',
      'affect',
      'batslap',
      'slap',
      'beautiful',
      'beauty',
      'bed',
      'bobross',
      'captcha',
      'delete',
      'del',
      'jail',
      'kiss',
      'lisa',
      'notstonks',
      'notstonk',
      'rip',
      'ded',
      'spank',
      'stonks',
      'stonk',
      'tattoo',
      'trash',
      'triggered',
      'a4k',
      'announcement',
      'cat',
      'dog',
      'emit',
      'eval',
      'fban',
      'freevbucks',
      'vbucks',
      'fortnite',
      'reload',
      'rl',
      'sudo',
      'taco',
      'bugreport',
      'bug',
      'help',
      'halp',
      'invite',
      'ping',
      'pong',
      'serverinfo',
      'server',
      'guild',
      'guildinfo',
      'stats',
      'botinfo',
      'info',
      'suggest',
      'suggest',
      'support',
      'uptime',
      'userinfo',
      'whois',
      'addrole',
      'ban',
      'begone',
      'config',
      'conf',
      'esay',
      'embed',
      'giveaway',
      'g',
      'kick',
      'markdown',
      'nuke',
      'poll',
      'purge',
      'reply',
      'sayreply',
      'rolemenu',
      'say',
      'echo',
      'slow',
      'slowmo',
      'slowmode',
      'panik',
      'tempban',
      'timeout',
      'shh',
      'mute',
      'unban',
      'add',
      'close',
      'new',
      'open',
      'remove',
      'rename',
      'tembed',
      'ticket'
    ];

    const command = commandArray.filter((obj) => obj === cmd.toLowerCase());
    if (!message.content.startsWith(prefixcommand)) return;

    if (command.length) {
      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .setTitle(`${this.client.user.username}`)
        .setDescription(`${message.author}, __**${this.client.user.username}**__ commands now use slash commands rather than message prefixes.
[You can learn more about the changes in the news post titled **'Slash Commands Migration'** by clicking here...](https://ragnarokbot.com/#news)

To use the \`${command}\` command, you should try \`/${command}\` or find the command within the \`/help\` menu.

*Stuck? Join the* [**Support Server**](https://discord.gg/Q3ZhdRJ).`);
      message.reply({ embeds: [embed] });

      setTimeout(() => {
        if (message) {
          message.delete();
        }
      }, 1000);
    }
  }
};

export default EventF;
