/* eslint-disable max-depth */
/* eslint-disable consistent-return */
/* eslint-disable no-inline-comments */
/* eslint-disable no-mixed-operators */
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, codeBlock, EmbedBuilder, OverwriteType, PermissionsBitField } from 'discord.js';
import urlRegexSafe from 'url-regex-safe';
import fetch from 'node-fetch';
import { customAlphabet } from 'nanoid';
import movier from 'movier';
import Event from '../../Structures/Event.js';
import TicketConfig from '../../Mongo/Schemas/TicketConfig.js';
import Tickets from '../../Mongo/Schemas/Tickets.js';
import AFK from '../../Mongo/Schemas/AFK.js';
import Dad from '../../Mongo/Schemas/Dad.js';
import AntiScam from '../../Mongo/Schemas/AntiScam.js';
import AdsProtection from '../../Mongo/Schemas/AdsProtection.js';

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
        const guildsWithTickets = guilds.filter(async (guild) =>
          // Fetch the row from the db where role is not null
          TicketConfig.findOne({ GuildId: guild.id, Role: { $exists: true, $ne: null } })
        );

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
        const buttons = embedFields.map((obj) =>
          new ButtonBuilder()
            .setStyle(ButtonStyle.Success)
            .setLabel(`${obj.name.slice(0, obj.name.indexOf('.'))}`)
            .setCustomId(`modMail-${obj.value.substring(obj.value.indexOf('`') + 1, obj.value.lastIndexOf('`'))}`)
        );

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

            const suppRole = await TicketConfig.findOne({ GuildId: fetchGuild.id });

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

            const fetchBlacklist = await TicketConfig.findOne({ GuildId: fetchGuild.id });

            let foundBlacklist;

            if (!fetchBlacklist.Blacklist) {
              foundBlacklist = [];
            } else {
              foundBlacklist = await JSON.parse(fetchBlacklist.Blacklist);
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

            const checkTicketEx = await Tickets.findOne({ GuildId: fetchGuild.id, AuthorId: message.author.id });
            const roleCheckEx = await Tickets.findOne({ GuildId: fetchGuild.id });
            if (checkTicketEx) {
              if (checkTicketEx.ChannelId === null) {
                await Tickets.deleteOne({ GuildId: fetchGuild.id, AuthorId: message.author.id });
              }
              if (!fetchGuild.channels.cache.find((channel) => channel.id === checkTicketEx.ChannelId)) {
                await Tickets.deleteOne({ GuildId: fetchGuild.id, AuthorId: message.author.id });
              }
            }
            if (roleCheckEx) {
              if (!fetchGuild.roles.cache.find((role) => role.id === roleCheckEx.Role)) {
                await TicketConfig.findOneAndUpdate(
                  {
                    GuildId: fetchGuild.id
                  },
                  {
                    Role: null
                  }
                );
              }
            }

            const foundTicket = await Tickets.findOne({ GuildId: fetchGuild.id, AuthorId: message.author.id });
            if (foundTicket) {
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
            const id = await TicketConfig.findOne({ GuildId: fetchGuild.id });
            const reason = message.content;
            const randomString = nanoid();
            if (!id) {
              await new Tickets({
                GuildId: fetchGuild.id,
                TicketId: randomString,
                AuthorId: message.author.id,
                Reason: reason
              }).save();

              // Create the channel with the name "ticket-" then the user's ID.
              const role = fetchGuild.roles.cache.find((r) => r.id === suppRole.Role);
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
                .then(async (c) => {
                  await Tickets.findOneAndUpdate(
                    {
                      GuildId: fetchGuild.id,
                      TicketId: randomString
                    },
                    {
                      ChannelId: c.id
                    }
                  );

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

                  const logget = await TicketConfig.findOne({ GuildId: fetchGuild.id });
                  if (!logget) {
                    return;
                  }
                  const logchan = fetchGuild.channels.cache.find((chan) => chan.id === logget.LogChannel);
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
              const category = fetchGuild.channels.cache.find((chan) => chan.id === id.Category);

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
                  .then(async (chn) => {
                    chn.setParent(category.parentId);
                    chn.setPosition(category.rawPosition + 1);

                    newId = chn.id;

                    // Update the database
                    await TicketConfig.findOneAndUpdate(
                      {
                        GuildId: fetchGuild.id
                      },
                      {
                        Category: chn.id
                      }
                    );
                  });
              }

              await new Tickets({
                GuildId: fetchGuild.id,
                TicketId: randomString,
                AuthorId: message.author.id,
                Reason: reason
              }).save();

              let ticategory;
              if (fetchGuild.channels.cache.find((chan) => chan.id === id.Category)) {
                ticategory = id.Category;
              } else {
                await TicketConfig.findOneAndUpdate(
                  {
                    GuildId: fetchGuild.id
                  },
                  {
                    Category: null
                  }
                );
              }

              const role = fetchGuild.roles.cache.find((r) => r.id === suppRole.Role);
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
                  await TicketConfig.findOneAndUpdate(
                    {
                      GuildId: fetchGuild.id,
                      TicketId: randomString
                    },
                    {
                      ChannelId: c.id
                    }
                  );

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
                  const logget = await TicketConfig.findOne({ GuildId: fetchGuild.id });
                  if (!logget) {
                    return;
                  }

                  const logchan = fetchGuild.channels.cache.find((chan) => chan.id === logget.LogChannel);
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
    await modMail();

    if (!message.guild || message.author.bot) return;

    const messageArray = message.content.split(' ');
    const dadArgs = messageArray.slice(1);
    const oargresult = dadArgs.join(' ');

    // AFK Module
    async function afkModule(client) {
      const { mentions } = message;
      const pingCheck = await AFK.findOne({ GuildId: message.guild.id });
      const afkGrab = await AFK.findOne({ GuildId: message.guild.id, UserId: message.author.id });

      if (afkGrab) {
        // if (command && command.name === 'afk') return; // this wont work for /afk so figure it out hehe
        await AFK.deleteOne({ GuildId: message.guild.id, UserId: message.author.id });

        const embed = new EmbedBuilder().setColor(message.member.displayHexColor).addFields({
          name: `**${client.user.username} - AFK**`,
          value: `**◎** ${message.author.tag} is no longer AFK.`
        });
        message.channel.send({ embeds: [embed] }).then((m) => client.utils.deletableCheck(m, 10000));
        return;
      }

      if (mentions.users.size > 0 && pingCheck) {
        const afkCheck = await AFK.findOne({ GuildId: message.guild.id, UserId: mentions.users.first().id });
        if (afkCheck) {
          const error = new EmbedBuilder().setColor(message.member.displayHexColor).addFields({
            name: `**${client.user.username} - AFK**`,
            value: `**◎** Please do not ping ${mentions.users.first()}, they are currently AFK with the reason:\n\n${afkCheck.reason}`
          });
          message.channel.send({ embeds: [error] }).then((m) => client.utils.deletableCheck(m, 10000));
        }
      }
    }
    await afkModule(this.client, message);

    // Easter Egg/s
    if (message.content.includes('(╯°□°）╯︵ ┻━┻')) {
      message.reply({
        content: 'Leave my table alone!\n┬─┬ ノ( ゜-゜ノ)'
      });
    }

    // Balance
    if (message.author.bot) return;
    await this.client.utils.updateEconomy(message);
    await this.client.utils.updateLevel(message, this.client);

    // Dad Bot
    async function dadBot() {
      const dadbot = await Dad.findOne({ GuildId: message.guild.id });

      if (!dadbot) {
        return;
      }

      if (dadCooldown.has(message.author.id)) return;

      const messageContent = message.content.toLowerCase();
      if (!(messageContent.startsWith('im ') || messageContent.startsWith('i\'m '))) {
        return;
      }

      const messageArr = messageContent.split(' ');
      if (messageArr.length === 1) {
        return;
      }

      const matches = urlRegexSafe({ strict: false }).test(messageContent);
      if (matches) {
        message.channel.send({
          files: ['./Storage/Images/dadNo.png']
        });
      } else if (messageContent.startsWith('im dad') || messageContent.startsWith('i\'m dad')) {
        message.channel.send({ content: 'No, I\'m Dad!' });
      } else if (messageContent.includes('@everyone') || messageContent.includes('@here')) {
        message.reply({ content: '<:pepebruh:987742251297931274>' });
      } else {
        message.channel.send({ content: `Hi ${oargresult}, I'm Dad!` });
      }

      if (!dadCooldown.has(message.author.id)) {
        dadCooldown.add(message.author.id);
        setTimeout(() => {
          dadCooldown.delete(message.author.id);
        }, dadCooldownSeconds * 1000);
      }
    }
    await dadBot();

    async function antiScam(grabClient) {
      const antiscam = await AntiScam.findOne({ GuildId: message.guild.id });
      if (antiscam) {
        if (!message.member.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          const npPerms = new EmbedBuilder().setColor(grabClient.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${grabClient.user.username} - Anti Scam**`,
            value: '**◎ Error:** I do not have the `MANAGE_MESSAGES` permissions. Disabling Anti Scam.'
          });
          message.channel.send({ embeds: [npPerms] }).then((m) => grabClient.utils.deletableCheck(m, 0));
          await AntiScam.deleteOne({ GuildId: message.guild.id });
          return;
        }

        const reasons = [];

        const linksContent = grabClient.stenLinks;

        const linksRegex = new RegExp(`\\b${linksContent.join('\\b|\\b')}\\b`, 'ig');
        const match = linksRegex.exec(message.content.toLowerCase());
        if (match) {
          const matchedLink = match[0];
          console.log(`Matched link: ${matchedLink}`);
          reasons.push('Malicious Link');

          if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            if (message.member.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
              await grabClient.utils.messageDelete(message, 0);
              message.channel.send(`**◎ Your message contains: \`${reasons.join(', ')}\` and it was deleted, ${message.author}**`).then((msg) => {
                grabClient.utils.deletableCheck(msg, 5000);
              });
            }
          }
        }
      }
    }
    await antiScam(this.client);

    // Ads protection checks
    async function adsProt(grabClient) {
      const adsprot = await AdsProtection.findOne({ GuildId: message.guild.id });
      if (adsprot) {
        if (!message.member.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          const npPerms = new EmbedBuilder().setColor(grabClient.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${grabClient.user.username} - Ads Protection**`,
            value: '**◎ Error:** I do not have the `MANAGE_MESSAGES` permissions. Disabling Ads Protection.'
          });
          message.channel.send({ embeds: [npPerms] }).then((m) => grabClient.utils.deletableCheck(m, 0));
          await AdsProtection.deleteOne({ GuildId: message.guild.id });
          return;
        }

        if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages) && !message.channel.name.startsWith('ticket-')) {
          const matches = urlRegexSafe({ strict: false }).test(message.content.toLowerCase());
          if (matches) {
            if (message.member.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
              await grabClient.utils.messageDelete(message, 0);
              message.channel.send(`**◎ Your message contained a link and it was deleted, ${message.author}**`).then((msg) => {
                grabClient.utils.deletableCheck(msg, 5000);
              });
            }
          }
        }
      }
    }
    await adsProt(this.client);

    async function linkTag(grabClient) {
      const discordRegex = /https?:\/\/(?:ptb\.)?(?:canary\.)?(discordapp|discord)\.com\/channels\/(\d{1,18})\/(\d{1,18})\/(\d{1,19})/;

      const exec = discordRegex.exec(message.content);

      if (exec && message.guild.id === exec[2]) {
        const [, , guildID, channelID, messageID] = exec;

        const findGuild = grabClient.guilds.cache.get(guildID);
        const findChannel = findGuild.channels.cache.get(channelID);
        const validExtensions = ['gif', 'png', 'jpeg', 'jpg'];

        const messagePromises = [
          findChannel.messages.fetch({ message: messageID }),
          findChannel.messages.fetch({ message: messageID, cache: false })
        ];
        const [resolvedPromise, rejectedPromise] = await Promise.allSettled(messagePromises);
        const res = resolvedPromise.status === 'fulfilled' ? resolvedPromise.value : rejectedPromise.reason;

        if (res) {
          const unixEpochTimestamp = Math.floor(res.createdTimestamp / 1000);
          // Fetch the message author
          const user = grabClient.users.cache.find((a) => a.id === res.author.id);

          const embed = new EmbedBuilder()
            .setAuthor({
              name: `${user && user.username ? user.username : message.author.username}`,
              iconURL:
                user && user.displayAvatarURL ? user.displayAvatarURL({ extension: 'png' }) : message.author.displayAvatarURL({ extension: 'png' })
            })
            .setColor(grabClient.utils.color(message.guild.members.me.displayHexColor))
            .setFooter({ text: `Quoted by ${message.author.username}` })
            .setTimestamp();

          const attachmentCheck = res.attachments.first();
          if (res.content && attachmentCheck) {
            const attachmentUrl = attachmentCheck.url;
            const fileExtension = attachmentUrl.substring(attachmentUrl.lastIndexOf('.') + 1);
            if (!validExtensions.includes(fileExtension)) {
              embed.setDescription(`**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>\n${res.content.substring(0, 1048)}`);
            } else {
              embed.setDescription(`**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>\n${res.content.substring(0, 1048)}`);
              embed.setImage(attachmentUrl);
            }
          } else if (res.content) {
            embed.setDescription(`**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>\n${res.content.substring(0, 1048)}`);
          } else if (attachmentCheck) {
            const attachmentUrl = attachmentCheck.url;
            const fileExtension = attachmentUrl.substring(attachmentUrl.lastIndexOf('.') + 1);
            if (!validExtensions.includes(fileExtension)) {
              embed.setDescription(`**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>`);
            } else {
              embed.setDescription(`**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>`);
              embed.setImage(attachmentUrl);
            }
          }
          message.channel.send({ embeds: [embed] });
        }
      }
    }
    await linkTag(this.client);

    async function chatBot(grabClient) {
      if (message.guild) {
        if (message.author.bot) return;
        if (message.content.startsWith(`<@${grabClient.user.id}>`) || message.content.startsWith(`<@!${grabClient.user.id}>`)) {
          const apiArgs = message.content.trim().split(/ +/g).join(' ').split(' ');

          if (!apiArgs.length) return;

          await message.channel.sendTyping();

          const indexOfSpace = message.content.indexOf(' ');
          const trimmed = message.content.substring(indexOfSpace + 1);

          try {
            await fetch(`https://api.brainshop.ai/get?bid=169096&key=4EniC9NJwnodt29j&uid=${message.author.id}&msg=${encodeURIComponent(trimmed)}`)
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
    await chatBot(this.client);

    // Function to monitor the messageCreate event for IMDb links, and then fetch the content via API calls.
    async function imdbMonitor(client) {
      const regexPattern = /https?:\/\/(?:www\.)?imdb\.com\/title\/tt(\d+)(\/)?/;
      const match = message.content.toLowerCase().match(regexPattern);

      if (match) {
        const imdbId = `tt${match[1]}`;

        try {
          await movier.getTitleDetailsByIMDBId(imdbId).then((res) => {
            const embed = new EmbedBuilder()
                .setColor('#e0b10e')
                .setAuthor({
                  name: `${res.name} (${res.dates.titleYear}${res.mainType === 'series' ? ` - ${res.dates.endYear === null ? 'Still Airing' : res.dates.endYear}` : ''}) - ${client.utils.capitalise(res.mainType)}`,
                  url: match[0],
                  iconURL: 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/171_Imdb_logo_logos-1024.png'
                })
                .addFields({ name: 'Votes', value: `**<:imdb:977228158615027803> ${res.mainRate.rate}/10** *(${res.mainRate.votesCount.toLocaleString('en')} votes)*`, inline: true },
                    { name: 'Genres', value: client.utils.capitalise(res.genres.join(', ')), inline: true },
                           { name: 'Stars', value: res.casts.slice(0, 3).map(cast => cast.name).join(', ') })
                .setDescription(
                    `${codeBlock('text', `${res.plot}`)} `
                )
                .setImage(res.posterImage.url)
            message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } });
          })
        } catch (error) {
          console.error('Error during IMDb fetch:', error);
        }
        }
    }
    await imdbMonitor(this.client)
  }
};

export default EventF;
