import {
  EmbedBuilder,
  SlashCommandBuilder,
  PermissionsBitField,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ChannelType,
  OverwriteType
} from 'discord.js';
import discordTranscripts from 'discord-html-transcripts';
import SQLite from 'better-sqlite3';
import fetch from 'node-fetch';
import { customAlphabet } from 'nanoid';
import SlashCommand from '../../Structures/SlashCommand.js';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 7);

const db = new SQLite('./Storage/DB/db.sqlite');

const comCooldown = new Set();
const comCooldownSeconds = 20;

const slashData = new SlashCommandBuilder()
  .setName('ticket')
  .setDescription('Ticket commands')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('add')
      .setDescription('User to add to ticket')
      .addUserOption((option) => option.setName('user').setDescription('User to add to ticket').setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('close')
      .setDescription('Close ticket')
      .addStringOption((option) => option.setName('reason').setDescription('Reason for closing ticket'))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('new')
      .setDescription('Create new ticket')
      .addStringOption((option) => option.setName('reason').setDescription('Reason for opening ticket').setMaxLength(200))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('remove')
      .setDescription('Remove user from ticket')
      .addUserOption((option) => option.setName('user').setDescription('Remove user from ticket').setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('rename')
      .setDescription('Rename ticket')
      .addStringOption((option) => option.setName('name').setDescription('Rename ticket').setMinLength(4).setMaxLength(40).setRequired(true))
  )
  .addSubcommand((subcommand) => subcommand.setName('embed').setDescription('Generate ticket embed'));

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Ticket related commands',
      category: 'Moderation',
      options: slashData,
      botPerms: ['ManageChannels']
    });
  }

  async run(interaction) {
    const fetchRole = db.prepare(`SELECT role FROM ticketConfig WHERE guildid = ${interaction.guild.id}`).get();

    if (fetchRole.role) {
      if (!interaction.guild.roles.cache.find((role) => role.id === fetchRole.role)) {
        const updateRole = db.prepare(`UPDATE ticketConfig SET role = (@role) WHERE guildid = ${interaction.guild.id}`);
        updateRole.run({
          role: null
        });
      }
    }

    if (!fetchRole) {
      const nomodRole = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Add**`,
        value:
          '**◎ Error:** This server doesn\'t have a `Support Team` role made, so the ticket can\'t be opened.\nIf you are an administrator, you can run the command `/config ticket role @role`.'
      });
      interaction.reply({ ephemeral: true, embeds: [nomodRole] });
      return;
    }

    const modRole = interaction.guild.roles.cache.find((supId) => supId.id === fetchRole.role);

    const subOptions = interaction.options.getSubcommand();

    if (subOptions === 'add') {
      if (!interaction.member.roles.cache.has(modRole.id) && interaction.user.id !== interaction.guild.ownerID) {
        const donthaveRole = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Add**`, value: `**◎ Error:** Sorry! You do not have the **${modRole}** role.` });
        interaction.reply({ ephemeral: true, embeds: [donthaveRole] });
        return;
      }

      const user = interaction.options.getMember('user');

      const channelArgs = interaction.channel.name.split('-');
      const foundTicket = db.prepare(`SELECT * FROM tickets WHERE guildid = ${interaction.guild.id} AND ticketid = (@ticketid)`).get({
        ticketid: channelArgs[channelArgs.length - 1]
      });

      if (foundTicket) {
        if (user.permissionsIn(interaction.channel).has([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages])) {
          const nouser = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Add**`, value: '**◎ Error:** This user has already been added to the channel!' });
          interaction.reply({ ephemeral: true, embeds: [nouser] });
          return;
        }

        interaction.channel.permissionOverwrites //! TEST
          .create(user, {
            ViewChannel: true,
            SendMessages: true
          })
          .catch(console.error);
        const nouser = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Add**`, value: `**◎ Success:** ${user} has been added to the ticket!` });
        interaction.reply({ embeds: [nouser] });

        const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${interaction.guild.id};`).get();
        if (!logget) return;
        const logchan = interaction.guild.channels.cache.find((chan) => chan.id === logget.log);
        if (!logchan) return;
        const loggingembed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Add**`,
          value: `**◎ Success:** <@${interaction.user.id}> added ${user} to ticket ${interaction.channel}`
        });
        logchan.send({ embeds: [loggingembed] });
      } else {
        const errEmbed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Add**`, value: '**◎ Error:** This ticket could not be found.' });
        interaction.reply({ ephemeral: true, embeds: [errEmbed] });
      }
    }

    if (subOptions === 'close') {
      const channelArgs = interaction.channel.name.split('-');
      const foundTicket = db.prepare(`SELECT * FROM tickets WHERE guildid = ${interaction.guild.id} AND ticketid = (@ticketid)`).get({
        ticketid: channelArgs[channelArgs.length - 1]
      });

      // Make sure it's inside the ticket channel.
      if (foundTicket && interaction.channel.id !== foundTicket.chanid) {
        const badChannel = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Close**`,
          value: '**◎ Error:** You can\'t use the close command outside of a ticket channel.'
        });
        interaction.reply({ ephemeral: true, embeds: [badChannel] });
        return;
      }

      if (!foundTicket) {
        const errEmbed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Close**`,
          value: '**◎ Error:** You can\'t use the close command outside of a ticket channel.'
        });
        interaction.reply({ ephemeral: true, embeds: [errEmbed] });
        return;
      }

      if (!interaction.member.roles.cache.has(modRole.id) && interaction.user.id !== interaction.guild.ownerID) {
        const donthaveRole = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Close**`, value: `**◎ Error:** Sorry! You do not have the **${modRole}** role.` });
        interaction.reply({ ephemeral: true, embeds: [donthaveRole] });
        return;
      }

      if (!comCooldown.has(interaction.user.id)) {
        const buttonA = new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel('Close').setCustomId('close');
        const buttonB = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('Cancel').setCustomId('cancel');

        const row = new ActionRowBuilder().addComponents(buttonA, buttonB);

        const initial = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Close**`,
          value: '**◎ Confirmation:** Are you sure? Once confirmed, you cannot reverse this action!'
        });

        const m = await interaction.reply({ components: [row], embeds: [initial] });

        const filter = (but) => but.user.id === interaction.user.id;

        const collector = m.createMessageComponentCollector({ filter, time: 15000 });

        if (!comCooldown.has(interaction.user.id)) {
          comCooldown.add(interaction.user.id);
        }
        setTimeout(() => {
          if (comCooldown.has(interaction.user.id)) {
            comCooldown.delete(interaction.user.id);
          }
        }, comCooldownSeconds * 1000);

        collector.on('collect', async (b) => {
          await b.deferUpdate();

          if (b.customId === 'close') {
            const fetchTick = db.prepare('SELECT * FROM tickets').all();
            if (!fetchTick) return;

            // Filter fetchTick where chanid === interaction.channel.id
            const ticket = fetchTick.find((t) => t.chanid === interaction.channel.id);
            if (!ticket) return;

            const closeReason = interaction.options.getString('name') || '';

            const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Ticket**`,
              value: 'Please stand-by while I gather all messages. This may take a while dependant on how many messages are in this channel.'
            });
            interaction.channel.send({ embeds: [embed] });

            // Generate random string
            const random = (length = 40) => {
              // Declare all characters
              const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

              // Pick characers randomly
              let str = '';
              for (let i = 0; i < length; i += 1) {
                str += chars.charAt(Math.floor(Math.random() * chars.length));
              }

              return str;
            };

            const staticFileNameGen = random();
            const staticFileName = `${interaction.channel.name}-_-${staticFileNameGen}.html`;
            const { channel } = interaction;

            channel.name = staticFileName;

            const fixedName = interaction.channel.name.substr(0, interaction.channel.name.indexOf('-_-'));

            const attachment = await discordTranscripts.createTranscript(channel, {
              limit: -1,
              returnBuffer: true,
              saveImages: true,
              fileName: staticFileName
            });
            const buffered = Buffer.from(attachment.attachment).toString();

            const authorizationSecret = 'pmzg!SD#9H8E#PzGMhe5dr&Qo5EQReLy@cqf87QB';

            const response = await fetch('https://www.ragnarokbot.com/index.php', {
              method: 'POST',
              body: buffered,
              headers: { 'X-Auth': authorizationSecret }
            });

            const data = await response.status;

            let transLinkText;
            let openTranscript;
            let transcriptRow;

            if (data !== 200) {
              transLinkText = '`Unavailable`';
            } else {
              transLinkText = `[**Click Here**](https://www.ragnarokbot.com/transcripts/${staticFileName})`;
              // Transcript button
              openTranscript = new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setEmoji('<:ticketTranscript:998229979609440266>')
                .setLabel('View Transcript')
                .setURL(`https://www.ragnarokbot.com/transcripts/${staticFileName}`);

              transcriptRow = new ActionRowBuilder().addComponents(openTranscript);
            }

            if (interaction.channel) {
              channel.name = fixedName;
              interaction.channel.delete();
            }

            const deleteTicket = db.prepare(`DELETE FROM tickets WHERE guildid = ${interaction.guild.id} AND ticketid = (@ticketid)`);
            deleteTicket.run({
              ticketid: channelArgs[channelArgs.length - 1]
            });

            const epoch = Math.floor(new Date().getTime() / 1000);

            const user = this.client.users.cache.find((a) => a.id === ticket.authorid);
            if (user) {
              const logEmbed = new EmbedBuilder()
                .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
                .setAuthor({
                  name: 'Ticket Closed',
                  iconURL: interaction.guild.iconURL({ extension: 'png' })
                })
                .addFields(
                  {
                    name: '<:ticketId:998229977004781618> **Ticket ID**',
                    value: `\`${channelArgs[channelArgs.length - 1]}\``,
                    inline: true
                  },
                  {
                    name: '<:ticketOpen:998229978267258881> **Opened By**',
                    value: `${user}`,
                    inline: true
                  },
                  {
                    name: '<:ticketClose:998229974634991646> **Closed By**',
                    value: `${interaction.user}`,
                    inline: true
                  },
                  {
                    name: '<:ticketTranscript:998229979609440266> **Transcript**',
                    value: `${transLinkText}`,
                    inline: true
                  },
                  {
                    name: '<:ticketCloseTime:998229975931048028> **Time Closed**',
                    value: `<t:${epoch}>`,
                    inline: true
                  },
                  { name: '\u200b', value: '\u200b', inline: true },
                  { name: '🖋️ **Reason**', value: `${closeReason}` }
                )
                .setTimestamp();
              user
                .send(transcriptRow ? { components: [transcriptRow], embeds: [logEmbed] } : { embeds: [logEmbed] })
                .then(() => {
                  // eslint-disable-next-line arrow-body-style
                })
                .catch(() => {});
            }

            const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${interaction.guild.id};`).get();
            if (!logget) {
              return;
            }

            const logchan = interaction.guild.channels.cache.find((chan) => chan.id === logget.log);
            if (!logchan) {
              return;
            }

            const logEmbed = new EmbedBuilder()
              .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
              .setAuthor({
                name: 'Ticket Closed',
                iconURL: interaction.guild.iconURL({ extension: 'png' })
              })
              .addFields(
                {
                  name: '<:ticketId:998229977004781618> **Ticket ID**',
                  value: `\`${channelArgs[channelArgs.length - 1]}\``,
                  inline: true
                },
                {
                  name: '<:ticketOpen:998229978267258881> **Opened By**',
                  value: `${user}`,
                  inline: true
                },
                {
                  name: '<:ticketClose:998229974634991646> **Closed By**',
                  value: `${interaction.user}`,
                  inline: true
                },
                {
                  name: '<:ticketTranscript:998229979609440266> **Transcript**',
                  value: `${transLinkText}`,
                  inline: true
                },
                {
                  name: '<:ticketCloseTime:998229975931048028> **Time Closed**',
                  value: `<t:${epoch}>`,
                  inline: true
                },
                { name: '\u200b', value: '\u200b', inline: true },
                { name: '🖋️ **Reason**', value: `${closeReason}` }
              )
              .setTimestamp();
            logchan.send(transcriptRow ? { components: [transcriptRow], embeds: [logEmbed] } : { embeds: [logEmbed] });
            if (comCooldown.has(interaction.user.id)) {
              comCooldown.delete(interaction.user.id);
            }
            collector.stop('close');
          }
          if (b.customId === 'cancel') {
            collector.stop('cancel');
          }
        });
        collector.on('end', (_, reason) => {
          if (comCooldown.has(interaction.user.id)) {
            comCooldown.delete(interaction.user.id);
          }

          if (reason === 'cancel' || reason === 'time') {
            interaction.deleteReply();
          }
        });
      } else {
        return;
      }
    }

    if (subOptions === 'new') {
      // Ticket Embed
      const fetchTick = db.prepare(`SELECT * FROM ticketConfig WHERE guildid = ${interaction.guild.id}`).get();

      const channel = interaction.guild.channels.cache.get(fetchTick.ticketembedchan);

      if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        const botPerm = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Ticket**`,
          value: '**◎ Error:** It seems you have removed the `Manage Channels` permission from me. I cannot function properly without it :cry:'
        });
        interaction.reply({ ephemeral: true, embeds: [botPerm] });
        await interaction.deferUpdate();
        return;
      }

      // Make sure this is the user's only ticket.
      const foundTicket = db.prepare(`SELECT authorid FROM tickets WHERE guildid = ${interaction.guild.id} AND authorid = (@authorid)`);
      const checkTicketEx = db
        .prepare(`SELECT chanid FROM tickets WHERE guildid = ${interaction.guild.id} AND authorid = ${interaction.user.id}`)
        .get();

      if (checkTicketEx) {
        if (checkTicketEx.chanid === null) {
          db.prepare(`DELETE FROM tickets WHERE guildid = ${interaction.guild.id} AND authorid = ${interaction.user.id}`).run();
        }
        if (!interaction.guild.channels.cache.find((ch) => ch.id === checkTicketEx.chanid)) {
          db.prepare(`DELETE FROM tickets WHERE guildid = ${interaction.guild.id} AND authorid = ${interaction.user.id}`).run();
        }
      }

      // Already has a ticket
      if (foundTicket.get({ authorid: interaction.user.id })) {
        const cha = interaction.guild.channels.cache.get(checkTicketEx.chanid);
        if (cha) {
          const alreadyTicket = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Ticket**`,
            value: `**◎ Error:** It seems you already have a ticket open. | ${cha}`
          });
          interaction.reply({ ephemeral: true, embeds: [alreadyTicket] });
          return;
        }
      }

      // Make Ticket
      const id = db.prepare(`SELECT category FROM ticketConfig WHERE guildid = ${interaction.guild.id};`).get();
      const reason = interaction.options.getString('reason') || '';
      const randomString = nanoid();
      const nickName = interaction.guild.members.cache.get(interaction.user.id).displayName;

      const newTicket = db.prepare('INSERT INTO tickets (guildid, ticketid, authorid, reason) values (@guildid, @ticketid, @authorid, @reason);');
      newTicket.run({
        guildid: interaction.guild.id,
        ticketid: randomString,
        authorid: interaction.user.id,
        reason
      });

      let ticategory;
      if (interaction.guild.channels.cache.find((chan) => chan.id === id.category)) {
        ticategory = id.category;
      } else {
        const deleteCat = db.prepare(`UPDATE ticketConfig SET category = (@category) WHERE guildid = ${interaction.guild.id}`);
        deleteCat.run({
          category: null
        });
      }

      // Create the channel with the name "ticket-" then the user's ID.
      const role = interaction.guild.roles.cache.find((r) => r.id === fetchTick.role);
      const role2 = channel.guild.roles.everyone;

      // Check how many channels are in the category
      const category = interaction.guild.channels.cache.find((chan) => chan.id === id.category);
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
              guildid: `${interaction.guild.id}`,
              category: `${chn.id}`
            });
          });
      }

      interaction.guild.channels
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
              id: interaction.user.id,
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
            `UPDATE tickets SET chanid = (@chanid) WHERE guildid = ${interaction.guild.id} AND ticketid = (@ticketid)`
          );
          updateTicketChannel.run({
            chanid: c.id,
            ticketid: randomString
          });
          const newTicketE = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Ticket**`,
            value: `**◎ Success:** Your ticket has been created, <#${c.id}>.`
          });
          interaction.reply({ ephemeral: true, embeds: [newTicketE] });

          const buttonClose = new ButtonBuilder().setStyle(ButtonStyle.Danger).setLabel('🔒 Close').setCustomId('closeTicket');

          const buttonCloseReason = new ButtonBuilder()
            .setStyle(ButtonStyle.Danger)
            .setLabel('🔒 Close With Reason')
            .setCustomId('closeTicketReason');

          const row = new ActionRowBuilder().addComponents(buttonClose, buttonCloseReason);

          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .setTitle('New Ticket')
            .setDescription(
              `Welcome to our support system ${interaction.user}.\nPlease hold tight and a support member will be with you shortly.${
                reason
                  ? `\n\n\nYou opened this ticket for the following reason:\n\`\`\`${reason}\`\`\``
                  : '\n\n\n**Please specify a reason for opening this ticket.**'
              }`
            );
          c.send({ components: [row], embeds: [embed] });

          if (id) {
            if (!fetchTick.log) {
              return;
            }

            const logchan = interaction.guild.channels.cache.find((chan) => chan.id === fetchTick.log);
            if (!logchan) return;

            const openEpoch = Math.floor(new Date().getTime() / 1000);

            const logEmbed = new EmbedBuilder()
              .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
              .setAuthor({
                name: 'Ticket Opened',
                iconURL: interaction.guild.iconURL({ extension: 'png' })
              })
              .addFields(
                {
                  name: '<:ticketId:998229977004781618> **Ticket ID**',
                  value: `[${randomString}](${c.url})`,
                  inline: true
                },
                {
                  name: '<:ticketOpen:998229978267258881> **Opened By**',
                  value: `${interaction.user}`,
                  inline: true
                },
                {
                  name: '<:ticketCloseTime:998229975931048028> **Time Opened**',
                  value: `<t:${openEpoch}>`,
                  inline: true
                },
                {
                  name: '🖋️ **Reason**',
                  value: `${reason || 'No reason provided.'}`,
                  inline: true
                }
              )
              .setTimestamp();
            logchan.send({ embeds: [logEmbed] });
          }
        })
        .catch(console.error);
    }

    if (subOptions === 'remove') {
      if (!interaction.member.roles.cache.has(modRole.id) && interaction.user.id !== interaction.guild.ownerID) {
        const donthaveRole = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Remove**`, value: `**◎ Error:** Sorry! You do not have the **${modRole}** role.` });
        interaction.reply({ ephemeral: true, embeds: [donthaveRole] });
        return;
      }

      const rUser = interaction.options.getMember('user'); //! TEST

      const channelArgs = interaction.channel.name.split('-');
      const foundTicket = db.prepare(`SELECT * FROM tickets WHERE guildid = ${interaction.guild.id} AND ticketid = (@ticketid)`).get({
        ticketid: channelArgs[channelArgs.length - 1]
      });

      if (foundTicket) {
        const getChan = interaction.channel;

        if (!rUser.permissionsIn(getChan).has([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages])) {
          const nouser = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Remove**`, value: '**◎ Error:** This user is not in this channel!' });
          interaction.reply({ ephemeral: true, embeds: [nouser] });
          return;
        }

        getChan.permissionOverwrites
          .create(rUser, {
            VIEW_CHANNEL: false
          })
          .catch(console.error);
        const removed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Remove**`, value: `**◎ Success:** ${rUser} has been removed from the ticket!` });
        getChan.send({ embeds: [removed] });
        const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${interaction.guild.id};`).get();
        const logchan = interaction.guild.channels.cache.find((chan) => chan.id === logget.log);
        if (!logchan) return;
        const loggingembed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .setDescription(`<@${interaction.user.id}> removed ${rUser} from ticket <#${getChan.id}>`);
        logchan.send({ embeds: [loggingembed] });
      } else {
        const errEmbed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Remove**`, value: '**◎ Error:** This ticket could not be found.' });
        interaction.reply({ ephemeral: true, embeds: [errEmbed] });
      }
    }

    if (subOptions === 'rename') {
      if (!interaction.member.roles.cache.has(modRole.id) && interaction.user.id !== interaction.guild.ownerID) {
        const donthaveRole = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Rename**`, value: `**◎ Error:** Sorry! You do not have the **${modRole}** role.` });
        interaction.reply({ ephemeral: true, embeds: [donthaveRole] });
        return;
      }

      const channelArgs = interaction.channel.name.split('-');
      const foundTicket = db.prepare(`SELECT * FROM tickets WHERE guildid = ${interaction.guild.id} AND ticketid = (@ticketid)`).get({
        ticketid: channelArgs[channelArgs.length - 1]
      });

      if (foundTicket) {
        const getChan = interaction.channel;
        if (comCooldown.has(`${interaction.user.id}-${getChan.id}`)) {
          const donthaveRole = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Rename**`,
            value: '**◎ Error:** Sorry! You must wait at least 10 minutes before changing the channel name again due to an API restriction.'
          });
          interaction.reply({ ephemeral: true, embeds: [donthaveRole] });
          return;
        }
        if (!comCooldown.has(`${interaction.user.id}-${getChan.id}`)) {
          const argResult = interaction.options.getString('name');
          if (!argResult) {
            const donthaveRole = new EmbedBuilder()
              .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Rename**`, value: '**◎ Error:** Sorry! Please input a valid string.' });
            interaction.reply({ ephemeral: true, embeds: [donthaveRole] });
            return;
          }
          if (argResult.length > 40 || argResult.length < 4) {
            const donthaveRole = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Rename**`,
              value: '**◎ Error:** Sorry! Please keep the name length **below** 40 and **above** 4.'
            });
            interaction.reply({ ephemeral: true, embeds: [donthaveRole] });
            return;
          }
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Rename**`,
            value: `**◎ Success:** <@${interaction.user.id}> renamed ticket to \`${argResult}\``
          });
          interaction.reply({ embeds: [embed] });

          getChan.setName(`ticket-${argResult}-${foundTicket.ticketid}`);
          const logget = db.prepare(`SELECT log FROM ticketConfig WHERE guildid = ${interaction.guild.id};`).get();
          const logchan = interaction.guild.channels.cache.find((chan) => chan.id === logget.log);
          if (!logchan) return;
          const loggingembed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Rename**`,
            value: `**◎ Success:** <@${interaction.user.id}> renamed ticket from \`#${getChan.name}\` to <#${getChan.id}>`
          });
          logchan.send({ embeds: [loggingembed] });
          comCooldown.add(`${interaction.user.id}-${getChan.id}`);
          setTimeout(() => {
            if (comCooldown.has(`${interaction.user.id}-${getChan.id}`)) {
              comCooldown.delete(`${interaction.user.id}-${getChan.id}`);
            }
          }, comCooldownSeconds * 1000);
        }
      } else {
        const errEmbed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Rename**`, value: '**◎ Error:** This ticket could not be found.' });
        interaction.reply({ ephemeral: true, embeds: [errEmbed] });
      }
    }

    if (subOptions === 'embed') {
      if (!interaction.member.roles.cache.has(modRole.id) && interaction.user.id !== interaction.guild.ownerID) {
        const donthaveRole = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - TicketEmbed**`,
          value: `**◎ Error:** Sorry! You do not have the **${modRole}** role.`
        });
        interaction.reply({ ephemeral: true, embeds: [donthaveRole] });
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .setTitle('Create a Ticket')
        .setDescription('By clicking the button, a ticket will be opened for you.')
        .setFooter({ text: 'Ragnarok Bot', iconURL: this.client.user.avatarURL() });

      const button = new ButtonBuilder().setStyle(ButtonStyle.Success).setLabel('📩 Open a ticket 📩').setCustomId('createTicket');

      const row = new ActionRowBuilder().addComponents(button);

      const foundtEmbed = db.prepare(`SELECT * FROM ticketConfig WHERE guildid=${interaction.guild.id}`).get();
      if (!foundtEmbed) {
        const disabledTic = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - TicketEmbed**`, value: '**◎ Error:** Tickets are not enabled on this server!' });
        interaction.reply({ ephemeral: true, embeds: [disabledTic] });
        return;
      }

      const checkEmbedEx = db.prepare(`SELECT ticketembed FROM ticketConfig WHERE guildid = ${interaction.guild.id}`).get();
      if (checkEmbedEx) {
        await interaction.reply({ components: [row], embeds: [embed] }).then(async (a) => {
          const update = db.prepare(
            'UPDATE ticketConfig SET ticketembed = (@ticketembed), ticketembedchan = (@ticketEChan) WHERE guildid = (@guildid);'
          );
          update.run({
            guildid: `${interaction.guild.id}`,
            ticketembed: `${a.id}`,
            ticketEChan: `${interaction.channel.id}`
          });
        });
      }
    }
  }
};

export default SlashCommandF;
