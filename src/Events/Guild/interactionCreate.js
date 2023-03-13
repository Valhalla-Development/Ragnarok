import {
  EmbedBuilder,
  PermissionsBitField,
  ButtonBuilder,
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  InteractionType,
  ButtonStyle,
  OverwriteType,
  ChannelType,
  codeBlock
} from 'discord.js';
import moment from 'moment';
import { customAlphabet } from 'nanoid';
import discordTranscripts from 'discord-html-transcripts';
import fetchPkg from 'node-fetch';
import Event from '../../Structures/Event.js';
import Logging from '../../Mongo/Schemas/Logging.js';
import Tickets from '../../Mongo/Schemas/Tickets.js';
import TicketConfig from '../../Mongo/Schemas/TicketConfig.js';
import RoleMenu from '../../Mongo/Schemas/RoleMenu.js';

const nanoid = customAlphabet('0123456789abcdefghijklmnopqrstuvwxyz', 7);

export const EventF = class extends Event {
  async run(interaction) {
    // Update economy profile
    if (interaction.guild) {
      await this.client.utils.updateEconomy(interaction);
      await this.client.utils.updateLevel(interaction, this.client)
    }

    if (interaction.isChatInputCommand()) {
      if (!interaction.guild) return;
      const command = this.client.slashCommands.get(interaction.commandName.toLowerCase());
      if (!command) return;

      try {
        const botPermCheck = command.botPerms ? this.client.defaultPerms.add(command.botPerms) : this.client.defaultPerms;
        if (botPermCheck) {
          const missing = interaction.channel.permissionsFor(this.client.user).missing(botPermCheck);
          if (missing.length) {
            if (missing.includes('SendMessages') || missing.includes('EmbedLinks') || missing.includes('ViewChannel')) {
              const errorMsg = `'[PERMISSIONS ERROR]' An attempt to run SlashCommand: '${interaction.toString()}' in guild '${
                interaction.guild.name
              }' was made, but I am missing '${missing.join(', ')}' permission.`;
              console.error(
                `[\x1b[31mPERMISSIONS ERROR\x1b[0m] An attempt to run SlashCommand: '\x1b[92m${interaction.toString()}\x1b[0m' in guild \x1b[31m${
                  interaction.guild.name
                }\x1b[0m was made, but I am missing '\x1b[92m${missing.join(', ')}s\x1b[0m' permission.`
              );
              const channel = this.client.channels.cache.get('685973401772621843');
              if (!channel) return;
              channel.send(codeBlock('js', errorMsg));
              return;
            }
            const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - ${this.client.utils.capitalise(command.name)}**`,
              value: `**◎ Error:** I am missing \`${missing.join(', ')}\` permissions, they are required for this command.`
            });
            interaction.reply({ embeds: [embed] });
            return;
          }
        }

        const userPermCheck = command.userPerms ? this.client.defaultPerms.add(command.userPerms) : this.client.defaultPerms;
        if (!this.client.utils.checkOwner(interaction.user.id) && userPermCheck) {
          const missing = interaction.channel.permissionsFor(interaction.member).missing(userPermCheck);
          if (missing.length) {
            const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - ${this.client.utils.capitalise(command.name)}**`,
              value: `**◎ Error:** You are missing \`${missing.join(', ')}\` permissions, they are required for this command.`
            });
            interaction.reply({ ephemeral: true, embeds: [embed] });
            return;
          }
        }

        await command.run(interaction);
      } catch (error) {
        console.log(error);
      }

      if (this.client.logging === 'true') {
        const nowInMs = Date.now();
        const nowInSecond = Math.round(nowInMs / 1000);

        const logembed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor));

        logembed.addFields({
          name: `Guild: ${interaction.guild.name} | Date: <t:${nowInSecond}>`,
          value: codeBlock('kotlin', `'${interaction.toString()}' SlashCommand was executed by ${interaction.user.tag}`)
        });
        const LoggingNoArgs = `[\x1b[31m${moment().format(
          'LLLL'
        )}\x1b[0m] '\x1b[92m${interaction.toString()}\x1b[0m' SlashCommand was executed by \x1b[31m${interaction.user.tag}\x1b[0m (Guild: \x1b[31m${
          interaction.guild.name
        }\x1b[0m)`;
        this.client.channels.cache.get('694680953133596682').send({ embeds: [logembed] });
        console.log(LoggingNoArgs);
      }

      // Logging command exectuion
      const id = await Logging.findOne({ GuildId: interaction.guild.id });
      if (!id) return;

      const logs = id.ChannelId;
      if (!logs) return;

      if (id) {
        if (id.ChannelId === null) {
          await Logging.deleteOne({ GuildId: interaction.guild.id });
          return;
        }
        if (!interaction.guild.channels.cache.find((channel) => channel.id === id.ChannelId)) {
          await Logging.deleteOne({ GuildId: interaction.guild.id });
          return;
        }
      }

      const logEmbed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.guild.iconURL() })
        .setDescription(`**◎ ${interaction.user} used command in ${interaction.channel}**\n${codeBlock('yaml', `${interaction.toString()}`)}`)
        .setFooter({ text: `ID: ${interaction.channel.id}` })
        .setTimestamp();
      this.client.channels.cache.get(logs).send({ embeds: [logEmbed] });
    }

    if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
      const command = this.client.slashCommands.get(interaction.commandName.toLowerCase());
      if (!command) return;

      try {
        command.autoComplete(interaction);
      } catch (err) {
        console.error(err);
      }
    }

    if (interaction.type === InteractionType.ModalSubmit) {
      if (interaction.customId === `modal-${interaction.channelId}`) {
        const fetchTick = await Tickets.find();
        if (!fetchTick) return;

        // Filter fetchTick where chanid === interaction.channel.id
        const ticket = fetchTick.find((t) => t.ChannelId === interaction.channelId);
        if (!ticket) return;

        const firstResponse = interaction.fields.getTextInputValue(`textinput-${interaction.channelId}`);

        await interaction.deferReply({ ephemeral: true });
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

        const response = await fetchPkg('https://www.ragnarokbot.com/index.php', {
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

        const channelArgs = interaction.channel.name.split('-');

        await Tickets.deleteOne({ GuildId: interaction.guild.id, TicketId: channelArgs[channelArgs.length - 1] }); // TODO

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
              { name: '🖋️ **Reason**', value: `${firstResponse}` }
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
            { name: '🖋️ **Reason**', value: `${firstResponse}` }
          )
          .setTimestamp();
        logchan.send(transcriptRow ? { components: [transcriptRow], embeds: [logEmbed] } : { embeds: [logEmbed] });
      }
    }

    if (!interaction.isButton()) return;

    if (interaction.customId === 'closeTicket' || interaction.customId === 'closeTicketReason') {
      // Check if the button is inside a valid ticket
      const guild = this.client.guilds.cache.get(interaction.guild.id);
      const fetchRole = await TicketConfig.findOne({ GuildId: guild.id });
      if (!fetchRole) return;

      if (fetchRole.Role) {
        if (!guild.roles.cache.find((role) => role.id === fetchRole.Role)) {
          await TicketConfig.findOneAndUpdate(
            {
              GuildId: guild.id
            },
            {
              Role: null
            }
          );
        }
      }

      const modRole = interaction.guild.roles.cache.find((supId) => supId.id === fetchRole.Role);

      const fetchTick = await Tickets.find();
      if (!fetchTick) return;

      // Filter fetchTick where chanid === interaction.channel.id
      const ticket = fetchTick.find((t) => t.ChannelId === interaction.channel.id);
      if (!ticket) return;

      if (!interaction.member.roles.cache.has(fetchRole.Role) && interaction.user.id !== interaction.guild.ownerID) {
        const donthaveRole = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Add**`, value: `**◎ Error:** Sorry! You do not have the **${modRole}** role.` });
        interaction.reply({ ephemeral: true, embeds: [donthaveRole] });
        return;
      }

      // Check if bot has perms
      if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        const botPerm = new EmbedBuilder().setColor(this.client.utils.color(guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Ticket**`,
          value: '**◎ Error:** It seems you have removed the `Manage Channels` permission from me. I cannot function properly without it :cry:'
        });
        interaction.reply({ embeds: [botPerm] });
        await interaction.deferUpdate();
        return;
      }

      // "Support" role
      if (!fetchRole.Role) {
        const nomodRole = new EmbedBuilder().setColor(this.client.utils.color(guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Ticket**`,
          value:
            '**◎ Error:** This server doesn\'t have a `Support Team` role made, so the ticket can\'t be opened.\nIf you are an administrator, you can run the command `/config ticket role @role`.'
        });
        interaction.reply({ embeds: [nomodRole] });
        await interaction.deferUpdate();
        return;
      }

      // If no reason
      if (interaction.customId === 'closeTicket') {
        await interaction.channel.sendTyping();
        const embed = new EmbedBuilder().setColor(this.client.utils.color(guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Ticket**`,
          value: 'Please stand-by while I gather all messages. This may take a while dependant on how many messages are in this channel.'
        });
        interaction.reply({ embeds: [embed] });

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

        const response = await fetchPkg('https://www.ragnarokbot.com/index.php', {
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

        const channelArgs = interaction.channel.name.split('-');

        await Tickets.deleteOne({ GuildId: interaction.guild.id, TicketId: channelArgs[channelArgs.length - 1] }); // TODO

        const epoch = Math.floor(new Date().getTime() / 1000);

        const user = this.client.users.cache.find((a) => a.id === ticket.AuthorId);
        if (user) {
          const logEmbed = new EmbedBuilder()
            .setColor(this.client.utils.color(guild.members.me.displayHexColor))
            .setAuthor({
              name: 'Ticket Closed',
              iconURL: guild.iconURL({ extension: 'png' })
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
              { name: '\u200b', value: '\u200b', inline: true }
            )
            .setTimestamp();
          user
            .send(transcriptRow ? { components: [transcriptRow], embeds: [logEmbed] } : { embeds: [logEmbed] })
            .then(() => {
              // eslint-disable-next-line arrow-body-style
            })
            .catch(() => {});
        }

        const logget = await TicketConfig.findOne({ GuildId: guild.id });

        const logchan = guild.channels.cache.find((chan) => chan.id === logget.LogChannel);
        if (!logchan) {
          return;
        }

        const logEmbed = new EmbedBuilder()
          .setColor(this.client.utils.color(guild.members.me.displayHexColor))
          .setAuthor({
            name: 'Ticket Closed',
            iconURL: guild.iconURL({ extension: 'png' })
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
            { name: '\u200b', value: '\u200b', inline: true }
          )
          .setTimestamp();
        logchan.send(transcriptRow ? { components: [transcriptRow], embeds: [logEmbed] } : { embeds: [logEmbed] });
      }

      if (interaction.customId === 'closeTicketReason') {
        const modal = new ModalBuilder().setCustomId(`modal-${ticket.ChannelId}`).setTitle('Close Ticket');

        const reasonModal = new TextInputBuilder()
          .setCustomId(`textinput-${ticket.ChannelId}`)
          .setLabel('Reason')
          .setStyle('Paragraph')
          .setMinLength(4)
          .setMaxLength(400)
          .setPlaceholder('Input your reason for closing this ticket')
          .setRequired(true);

        const firstActionRow = new ActionRowBuilder().addComponents(reasonModal);

        modal.addComponents(firstActionRow);

        await interaction.showModal(modal, {
          client: this.client,
          interaction
        });
      }
    }

    if (interaction.customId === 'createTicket') {
      // Ticket Embed
      const guild = this.client.guilds.cache.get(interaction.guild.id);
      const fetch = await TicketConfig.findOne({ GuildId: guild.id });
      if (!fetch) {
        const alreadyTicket = new EmbedBuilder().setColor(this.client.utils.color(guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Ticket**`,
          value: '**◎ Error:** No ticket configuration found.\n\nPlease ask an administrator to set up the ticket system.'
        });
        interaction.reply({ embeds: [alreadyTicket], ephemeral: true });
        return;
      }
      const channel = guild.channels.cache.get(fetch.ticketembedchan);

      if (!fetch.ticketembed) {
        interaction.message.delete();
        await interaction.deferUpdate();
        return;
      }

      if (!guild.members.me.permissions.has(PermissionsBitField.Flags.ManageChannels)) {
        const botPerm = new EmbedBuilder().setColor(this.client.utils.color(guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Ticket**`,
          value: '**◎ Error:** It seems you have removed the `Manage Channels` permission from me. I cannot function properly without it :cry:'
        });
        channel.send({ embeds: [botPerm], ephemeral: true });
        await interaction.deferUpdate();
        return;
      }

      const fetchBlacklist = await TicketConfig.findOne({ GuildId: interaction.guild.id });

      let foundBlacklist;

      if (!fetchBlacklist.Blacklist) {
        foundBlacklist = [];
      } else {
        foundBlacklist = await JSON.parse(fetchBlacklist.Blacklist);
      }

      if (foundBlacklist.includes(interaction.user.id)) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Ticket**`,
          value: '**◎ Error:** You are blacklisted from creating tickets in this guild.'
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      // "Support" role
      if (!fetch.Role) {
        const nomodRole = new EmbedBuilder().setColor(this.client.utils.color(guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Ticket**`,
          value:
            '**◎ Error:** This server doesn\'t have a `Support Team` role made, so the ticket can\'t be opened.\nIf you are an administrator, you can run the command `/config ticket role @role`'
        });
        channel.send({ embeds: [nomodRole], ephemeral: true });
        await interaction.deferUpdate();
        return;
      }

      // Make sure this is the user's only ticket.
      const checkTicketEx = await Tickets.findOne({ GuildId: guild.id, AuthorId: interaction.user.id });

      if (checkTicketEx) {
        if (checkTicketEx.ChannelId === null) {
          await Tickets.deleteOne({ GuildId: guild.id, AuthorId: interaction.user.id }); // TODO
        }
        if (!guild.channels.cache.find((ch) => ch.id === checkTicketEx.ChannelId)) {
          await Tickets.deleteOne({ GuildId: guild.id, AuthorId: interaction.user.id }); // TODO
        }
      }

      if (fetch.Role) {
        if (!guild.roles.cache.find((role) => role.id === fetch.Role)) {
          await TicketConfig.findOneAndUpdate(
            {
              GuildId: guild.id
            },
            {
              Role: null
            }
          );
        }
      }

      // Already has a ticket
      const foundTicket = await Tickets.findOne({ GuildId: guild.id, AuthorId: interaction.user.id });
      if (foundTicket) {
        try {
          const cha = guild.channels.cache.get(checkTicketEx.ChannelId);
          const alreadyTicket = new EmbedBuilder().setColor(this.client.utils.color(guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Ticket**`,
            value: `**◎ Error:** It seems you already have a ticket open. | ${cha}`
          });
          interaction.reply({ embeds: [alreadyTicket], ephemeral: true });
          return;
        } catch (e) {
          await interaction.deferUpdate();
          console.log(e);
          return;
        }
      }

      // Make Ticket
      const id = await TicketConfig.findOne({ GuildId: guild.id });
      const reason = '';
      const randomString = nanoid();
      const nickName = guild.members.cache.get(interaction.user.id).displayName;

      await new Tickets({
        GuildId: guild.id,
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
      const role = interaction.guild.roles.cache.find((r) => r.id === fetch.Role);
      const role2 = channel.guild.roles.everyone;

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
                Category: chn.id
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
              GuildId: guild.id,
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
          interaction.reply({ embeds: [newTicketE], ephemeral: true });

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
            if (!fetch.LogChannel) {
              return;
            }

            const logchan = guild.channels.cache.find((chan) => chan.id === fetch.LogChannel);
            if (!logchan) return;

            const openEpoch = Math.floor(new Date().getTime() / 1000);

            const logEmbed = new EmbedBuilder()
              .setColor(this.client.utils.color(guild.members.me.displayHexColor))
              .setAuthor({
                name: 'Ticket Opened',
                iconURL: guild.iconURL({ extension: 'png' })
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

    if (interaction.customId.startsWith('rm-')) {
      const guild = this.client.guilds.cache.get(interaction.guild.id);
      const user = guild.members.cache.get(interaction.user.id);

      const lastRole = interaction.customId.lastIndexOf('-');

      const roleTrim = interaction.customId.substring(interaction.customId.length, lastRole + 1);

      const role = guild.roles.cache.get(roleTrim);

      // Fetch the db
      const foundRoleMenu = await RoleMenu.findOne({ GuildId: interaction.guild.id });

      // Parse the data
      const roleArray = JSON.parse(foundRoleMenu.RoleList);

      // Check if roles in the array exist in the server, if it does not, remove it from the array
      const roleArrayCleaned = roleArray.filter((roleCheck) => !!interaction.guild.roles.cache.has(roleCheck));

      if (!roleArrayCleaned.includes(role.id)) {
        const alreadyRole = new EmbedBuilder().setColor(this.client.utils.color(guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Role Menu**`,
          value: '**◎ Error:** The role you selected no longer exists on the server.'
        });
        interaction.reply({ embeds: [alreadyRole], ephemeral: true });

        await RoleMenu.findOneAndUpdate(
          {
            GuildId: interaction.guild.id
          },
          {
            RoleList: JSON.stringify(roleArrayCleaned)
          }
        );
        return;
      }

      // check if user has role already
      if (user.roles.cache.has(role.id)) {
        user.roles
          .remove(role)
          .then(() => {
            const alreadyRole = new EmbedBuilder().setColor(this.client.utils.color(guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Role Menu**`,
              value: `**◎ Success:** I have removed the ${role} role from you.`
            });
            interaction.reply({ embeds: [alreadyRole], ephemeral: true });
          })
          .catch(() => {
            const embed = new EmbedBuilder().setColor(this.client.utils.color(guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Rolemenu**`,
              value: '**◎ Error:** An error occured.'
            });
            interaction.reply({ embeds: [embed], ephemeral: true });
          });
      } else {
        // add role to user
        user.roles
          .add(role)
          .then(() => {
            const embed = new EmbedBuilder().setColor(this.client.utils.color(guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Rolemenu**`,
              value: `**◎ Success:** I have added the ${role} role to you!`
            });
            interaction.reply({ embeds: [embed], ephemeral: true });
          })
          .catch(() => {
            const embed = new EmbedBuilder().setColor(this.client.utils.color(guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Rolemenu**`,
              value: '**◎ Error:** An error occured.'
            });
            interaction.reply({ embeds: [embed], ephemeral: true });
          });
      }
    }
    function noSpecialCharacters(str) {
      str.replace(' ', '-');
      return str.replace(/[^a-zA-Z0-9,;\-.!? ]/g, '');
    }
  }
};

export default EventF;
