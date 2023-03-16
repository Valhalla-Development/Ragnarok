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
import fetch from 'node-fetch';
import { customAlphabet } from 'nanoid';
import SlashCommand from '../../Structures/SlashCommand.js';
import TicketConfig from '../../Mongo/Schemas/TicketConfig.js';
import Tickets from '../../Mongo/Schemas/Tickets.js';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 7);

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
  .addSubcommand((subcommand) => subcommand.setName('embed').setDescription('Generate ticket embed'))
  .addSubcommandGroup((group) =>
    group
      .setName('blacklist')
      .setDescription('Configure the blacklist feature within the ticket module')
      .addSubcommand((subcommand) =>
        subcommand
          .setName('add')
          .setDescription('User to blacklist')
          .addUserOption((option) => option.setName('user').setDescription('User to blacklist').setRequired(true))
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('remove')
          .setDescription('User to remove from the blacklist')
          .addUserOption((option) => option.setName('user').setDescription('User to remove from the blacklist').setRequired(true))
      )
  );

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
    const fetchRole = await TicketConfig.findOne({ GuildId: interaction.guild.id });

    if (!fetchRole) {
      const nomodRole = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Add**`,
        value:
          '**◎ Error:** This server doesn\'t have a `Support Team` role made, so the ticket can\'t be opened.\nIf you are an administrator, you can run the command `/config ticket role @role`.'
      });
      interaction.reply({ ephemeral: true, embeds: [nomodRole] });
      return;
    }

    if (fetchRole.Role) {
      if (!interaction.guild.roles.cache.find((role) => role.id === fetchRole.Role)) {
        await TicketConfig.findOneAndUpdate(
          {
            GuildId: interaction.guild.id
          },
          {
            Role: null
          }
        );
      }
    }

    const modRole = interaction.guild.roles.cache.find((supId) => supId.id === fetchRole.Role);

    const subOptions = interaction.options.getSubcommand();
    const subGroup = interaction.options.getSubcommandGroup();

    if (!subGroup) {
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

        const foundTicket = await Tickets.findOne({ GuildId: interaction.guild.id, TicketId: channelArgs[channelArgs.length - 1] });

        if (foundTicket) {
          if (user.permissionsIn(interaction.channel).has([PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages])) {
            const nouser = new EmbedBuilder()
              .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Add**`, value: '**◎ Error:** This user has already been added to the channel!' });
            interaction.reply({ ephemeral: true, embeds: [nouser] });
            return;
          }

          interaction.channel.permissionOverwrites
            .create(user, {
              ViewChannel: true,
              SendMessages: true
            })
            .catch(console.error);
          const nouser = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Add**`, value: `**◎ Success:** ${user} has been added to the ticket!` });
          interaction.reply({ embeds: [nouser] });

          const logget = await TicketConfig.findOne({ GuildId: interaction.guild.id });
          if (!logget) return;
          const logchan = interaction.guild.channels.cache.find((chan) => chan.id === logget.LogChannel);
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
        const foundTicket = await Tickets.findOne({ GuildId: interaction.guild.id, TicketId: channelArgs[channelArgs.length - 1] });

        // Make sure it's inside the ticket channel.
        if (foundTicket && interaction.channel.id !== foundTicket.ChannelId) {
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

        collector.on('collect', async (b) => {
          await b.deferUpdate();

          if (b.customId === 'close') {
            const fetchTick = await Tickets.find();
            if (!fetchTick) return;

            // Filter fetchTick where chanid === interaction.channel.id
            const ticket = fetchTick.find((t) => t.ChannelId === interaction.channel.id);
            if (!ticket) return;

            const closeReason = interaction.options.getString('name') || 'No reason provided.';

            const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Ticket**`,
              value: 'Please stand-by while I gather all messages. This may take a while dependant on how many messages are in this channel.'
            });
            await interaction.followUp({ embeds: [embed] });

            const staticFileNameGen = Date.now();
            const staticFileName = `${noSpecialCharacters(interaction.channel.name)}-_-${staticFileNameGen}.html`;
            const { channel } = interaction;

            channel.name = staticFileName;

            const fixedName = interaction.channel.name.substr(0, interaction.channel.name.indexOf('-_-'));

            const attachment = await discordTranscripts.createTranscript(channel, {
              limit: -1,
              returnType: 'buffer',
              saveImages: true,
              fileName: staticFileName,
              poweredBy: false
            });
            const buffered = Buffer.from(attachment).toString();

            const authorizationSecret = 'pmzg!SD#9H8E#PzGMhe5dr&Qo5EQReLy@cqf87QB';

            const response = await fetch('https://www.ragnarokbot.com/index.php', {
              method: 'POST',
              body: buffered,
              headers: { 'X-Auth': authorizationSecret }
            });

            const data = response.status;

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

            await Tickets.deleteOne({ GuildId: interaction.guild.id, TicketId: channelArgs[channelArgs.length - 1] });

            const epoch = Math.floor(new Date().getTime() / 1000);

            const user = this.client.users.cache.find((a) => a.id === ticket.AuthorId);
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

            const logget = await TicketConfig.findOne({ GuildId: interaction.guild.id });
            if (!logget) {
              return;
            }

            const logchan = interaction.guild.channels.cache.find((chan) => chan.id === logget.LogChannel);
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
            collector.stop('close');
          }
          if (b.customId === 'cancel') {
            collector.stop('cancel');
          }
        });
        collector.on('end', (_, reason) => {
          if (reason === 'cancel' || reason === 'time') {
            interaction.deleteReply();
          }
        });
      }

      if (subOptions === 'new') {
        // Ticket Embed
        const fetchTick = await TicketConfig.findOne({ GuildId: interaction.guild.id });

        if (!interaction.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
          const botPerm = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Ticket**`,
            value: '**◎ Error:** It seems you have removed the `Manage Channels` permission from me. I cannot function properly without it :cry:'
          });
          interaction.reply({ ephemeral: true, embeds: [botPerm] });
          await interaction.deferUpdate();
          return;
        }

        const fetchBlacklist = await TicketConfig.findOne({ GuildId: interaction.guild.id });

        let foundBlacklist;

        if (!fetchBlacklist.Blacklist) {
          foundBlacklist = [];
        } else {
          foundBlacklist = await fetchBlacklist.Blacklist;
        }

        if (foundBlacklist.includes(interaction.user.id)) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Ticket**`,
            value: '**◎ Error:** You are blacklisted from creating tickets in this guild.'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        // Make sure this is the user's only ticket.
        const checkTicketEx = await Tickets.findOne({ GuildId: interaction.guild.id, AuthorId: interaction.user.id });

        if (checkTicketEx) {
          if (checkTicketEx.ChannelId === null) {
            await Tickets.deleteOne({ GuildId: interaction.guild.id, AuthorId: interaction.user.id });
          }
          if (!interaction.guild.channels.cache.find((ch) => ch.id === checkTicketEx.ChannelId)) {
            await Tickets.deleteOne({ GuildId: interaction.guild.id, AuthorId: interaction.user.id });
          }
        }

        // Already has a ticket
        const foundTicket = await Tickets.findOne({ GuildId: interaction.guild.id, AuthorId: interaction.user.id });
        if (foundTicket) {
          const cha = interaction.guild.channels.cache.get(checkTicketEx.ChannelId);
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
        const id = await TicketConfig.findOne({ GuildId: interaction.guild.id });
        const reason = interaction.options.getString('reason') || '';
        const randomString = nanoid();
        const nickName = interaction.guild.members.cache.get(interaction.user.id).displayName;

        await new Tickets({
          GuildId: interaction.guild.id,
          TicketId: randomString,
          AuthorId: interaction.user.id,
          Reason: reason
        }).save();

        let ticategory;
        if (interaction.guild.channels.cache.find((chan) => chan.id === id.Category)) {
          ticategory = id.Category;
        } else {
          await TicketConfig.findOneAndUpdate(
            {
              GuildId: interaction.guild.id
            },
            {
              Category: null
            }
          );
        }

        // Create the channel with the name "ticket-" then the user's ID.
        const role = interaction.guild.roles.cache.find((r) => r.id === fetchTick.Role);
        const role2 = interaction.guild.roles.everyone;

        // Check how many channels are in the category
        const category = interaction.guild.channels.cache.find((chan) => chan.id === id.Category);
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
                  GuildId: interaction.guild.id
                },
                {
                  channel: chn.id
                }
              );
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
          .then(async (c) => {
            await Tickets.findOneAndUpdate(
              {
                GuildId: interaction.guild.id,
                TicketId: randomString
              },
              {
                ChannelId: c.id
              }
            );

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

              const logchan = interaction.guild.channels.cache.find((chan) => chan.id === fetchTick.LogChannel);
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

        const rUser = interaction.options.getMember('user');

        const channelArgs = interaction.channel.name.split('-');

        const foundTicket = await Tickets.findOne({ GuildId: interaction.guild.id, TicketId: channelArgs[channelArgs.length - 1] });

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
              VIEW_CHANNEL: false // TODO ERROR, OLD PERMS
            })
            .catch(console.error);
          const removed = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Remove**`, value: `**◎ Success:** ${rUser} has been removed from the ticket!` });
          getChan.send({ embeds: [removed] });
          const logget = await TicketConfig.findOne({ GuildId: interaction.guild.id });
          const logchan = interaction.guild.channels.cache.find((chan) => chan.id === logget.LogChannel);
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

        const foundTicket = await Tickets.findOne({ GuildId: interaction.guild.id, TicketId: channelArgs[channelArgs.length - 1] }); // TODO TEST

        if (foundTicket) {
          const getChan = interaction.channel;

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

          getChan.setName(`ticket-${argResult}-${foundTicket.TicketId}`);

          const logget = await TicketConfig.findOne({ GuildId: interaction.guild.id });
          const logchan = interaction.guild.channels.cache.find((chan) => chan.id === logget.LogChannel);
          if (!logchan) return;
          const loggingembed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Rename**`,
            value: `**◎ Success:** <@${interaction.user.id}> renamed ticket from \`#${getChan.name}\` to <#${getChan.id}>`
          });
          logchan.send({ embeds: [loggingembed] });
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

        const foundtEmbed = await TicketConfig.findOne({ GuildId: interaction.guild.id });
        if (!foundtEmbed) {
          const disabledTic = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - TicketEmbed**`, value: '**◎ Error:** Tickets are not enabled on this server!' });
          interaction.reply({ ephemeral: true, embeds: [disabledTic] });
          return;
        }

        await interaction.deferReply();
        await interaction.deleteReply();

        await interaction.channel.send({ components: [row], embeds: [embed] }).then(async (a) => {
          await TicketConfig.findOneAndUpdate(
            {
              GuildId: interaction.guild.id
            },
            {
              Embed: a.id,
              EmbedChannel: interaction.channel.id
            }
          );
        });
      }
    }

    if (subGroup === 'blacklist') {
      const user = interaction.options.getMember('user');

      if (!interaction.member.roles.cache.has(modRole.id) && interaction.user.id !== interaction.guild.ownerID) {
        const donthaveRole = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Ticket Blacklist**`,
          value: `**◎ Error:** Sorry! You do not have the **${modRole}** role.`
        });
        interaction.reply({ ephemeral: true, embeds: [donthaveRole] });
        return;
      }

      // Check if user has a role that is higher than the message author
      if (user.roles.highest.position >= interaction.member.roles.highest.position) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Ticket Blacklist**`,
          value: '**◎ Error:** You cannot blacklist someone with a higher role than you!'
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      const fetchBlacklist = await TicketConfig.findOne({ GuildId: interaction.guild.id });

      let foundBlacklist;

      if (!fetchBlacklist.Blacklist) {
        foundBlacklist = [];
      } else {
        foundBlacklist = fetchBlacklist.Blacklist;
      }

      if (subOptions === 'add') {
        if (!foundBlacklist.includes(user.id)) {
          foundBlacklist.push(user.id);

          await TicketConfig.findOneAndUpdate(
            {
              GuildId: interaction.guild.id
            },
            {
              Blacklist: foundBlacklist
            }
          );

          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Ticket Blacklist**`,
            value: `**◎ Success:** ${user} has been blacklisted from creating tickets.`
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
        } else {
          const disabledTic = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Ticket Blacklist**`,
            value: `**◎ Error:** ${user} is already blacklisted. Did you mean \`/ticket blacklist remove <@user>\`?`
          });
          interaction.reply({ ephemeral: true, embeds: [disabledTic] });
        }
      } else if (subOptions === 'remove') {
        if (!foundBlacklist.includes(user.id)) {
          const disabledTic = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Ticket Blacklist**`,
            value: `**◎ Error:** ${user} is not blacklisted. Did you mean \`/ticket blacklist add <@user>\`?`
          });
          interaction.reply({ ephemeral: true, embeds: [disabledTic] });
        } else {
          const filtered = foundBlacklist.filter((obj) => obj !== user.id);

          await TicketConfig.findOneAndUpdate(
            {
              GuildId: interaction.guild.id
            },
            {
              Blacklist: !filtered.length ? [] : filtered
            }
          );

          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Ticket Blacklist**`,
            value: `**◎ Success:** ${user} has been removed from the ticket blacklist.`
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
        }
      }
    }
    function noSpecialCharacters(str) {
      return str.replace(/[^a-zA-Z0-9,;\-.!? ]/g, '');
    }
  }
};

export default SlashCommandF;
