/* eslint-disable no-restricted-syntax */
import { EmbedBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ChannelType, ButtonStyle, SlashCommandBuilder } from 'discord.js';
import fetch from 'node-fetch';
import Canvas from 'canvas';
import SlashCommand from '../../Structures/SlashCommand.js';
import BirthdayConfig from '../../Mongo/Schemas/BirthdayConfig.js';
import RoleMenu from '../../Mongo/Schemas/RoleMenu.js';
import Hastebin from '../../Mongo/Schemas/Hastebin.js';
import Dad from '../../Mongo/Schemas/Dad.js';
import AdsProtection from '../../Mongo/Schemas/AdsProtection.js';
import AntiScam from '../../Mongo/Schemas/AntiScam.js';
import AutoRole from '../../Mongo/Schemas/AutoRole.js';
import Logging from '../../Mongo/Schemas/Logging.js';
import TicketConfig from '../../Mongo/Schemas/TicketConfig.js';
import Welcome from '../../Mongo/Schemas/Welcome.js';
import StarBoard from '../../Mongo/Schemas/StarBoard.js';

const data = new SlashCommandBuilder()
  .setName('config')
  .setDescription('Configuration related commands')
  .addSubcommand((subcommand) => subcommand.setName('all').setDescription('View all config commands'))
  .addSubcommandGroup((group) =>
    group
      .setName('birthday')
      .setDescription('Configure the Birthday module')
      .addSubcommand((subcommand) =>
        subcommand
          .setName('channel')
          .setDescription('Channel Birthday alerts should be posted to')
          .addChannelOption((option) => option.setName('channel').setDescription('Channel Birthday alerts should be posted to').setRequired(true))
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('role')
          .setDescription('The role Birthday alerts should be pinged')
          .addRoleOption((option) => option.setName('role').setDescription('The role Birthday alerts should be pinged').setRequired(true))
      )
      .addSubcommand((subcommand) => subcommand.setName('off').setDescription('Disable the Birthday module'))
  )
  .addSubcommandGroup((group) =>
    group
      .setName('rolemenu')
      .setDescription('Configure the Role Menu module')
      .addSubcommand((subcommand) =>
        subcommand
          .setName('add')
          .setDescription('Add a role to the Role Menu')
          .addRoleOption((option) => option.setName('role').setDescription('Add a role to the Role Menu').setRequired(true))
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('remove')
          .setDescription('Remove a role from the Role Menu')
          .addRoleOption((option) => option.setName('role').setDescription('Remove a role from the Role Menu').setRequired(true))
      )
      .addSubcommand((subcommand) => subcommand.setName('clear').setDescription('Clear the Role Menu'))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('hastebin')
      .setDescription('Configure the HasteBin module')
      .addBooleanOption((option) => option.setName('toggle').setDescription('Enable/Disable URL Checker?').setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('dadbot')
      .setDescription('Configure the Dad Bot module')
      .addBooleanOption((option) => option.setName('toggle').setDescription('Enable/Disable Dad Bot module?').setRequired(true))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('adsprot')
      .setDescription('Configure the Ads Protection module')
      .addBooleanOption((option) => option.setName('toggle').setDescription('Enable/Disable Ads Protection module?').setRequired(true))
  )
  .addSubcommandGroup((group) =>
    group
      .setName('autorole')
      .setDescription('Configure the AutoRole module')
      .addSubcommand((subcommand) =>
        subcommand
          .setName('role')
          .setDescription('The role members should be given')
          .addRoleOption((option) => option.setName('role').setDescription('The role members should be given').setRequired(true))
      )
      .addSubcommand((subcommand) => subcommand.setName('off').setDescription('Disable the AutoRole module'))
  )
  .addSubcommandGroup((group) =>
    group
      .setName('logging')
      .setDescription('Configure the Logging module')
      .addSubcommand((subcommand) =>
        subcommand
          .setName('channel')
          .setDescription('The channel messages should be sent to')
          .addChannelOption((option) => option.setName('channel').setDescription('The channel messages should be send to').setRequired(true))
      )
      .addSubcommand((subcommand) => subcommand.setName('off').setDescription('Disable the Logging module'))
  )
  .addSubcommandGroup((group) =>
    group
      .setName('ticket')
      .setDescription('Configure the Ticket module')
      .addSubcommand((subcommand) =>
        subcommand
          .setName('channel')
          .setDescription('The channel ticket logs should be sent to')
          .addChannelOption((option) => option.setName('channel').setDescription('The channel ticket logs should be sent to').setRequired(true))
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('category')
          .setDescription('The category tickets should be added to')
          .addChannelOption((option) => option.setName('category').setDescription('The category tickets should be added to').setRequired(true))
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('role')
          .setDescription('The role that should see tickets')
          .addRoleOption((option) => option.setName('role').setDescription('The role that should see tickets').setRequired(true))
      )
      .addSubcommand((subcommand) => subcommand.setName('off').setDescription('Disable the Ticket module'))
  )
  .addSubcommandGroup((group) =>
    group
      .setName('welcome')
      .setDescription('Configure the Welcome module')
      .addSubcommand((subcommand) =>
        subcommand
          .setName('channel')
          .setDescription('The channel messages should be sent to')
          .addChannelOption((option) => option.setName('channel').setDescription('The channel messages should be send to').setRequired(true))
      )
      .addSubcommand((subcommand) =>
        subcommand
          .setName('image')
          .setDescription('The background of the welcome image (700x300)')
          .addStringOption((option) => option.setName('image').setDescription('The background of the welcome image').setRequired(true))
      )
      .addSubcommand((subcommand) => subcommand.setName('off').setDescription('Disable the Welcome module'))
  )
  .addSubcommandGroup((group) =>
    group
      .setName('starboard')
      .setDescription('Configure the Star Board module')
      .addSubcommand((subcommand) =>
        subcommand
          .setName('channel')
          .setDescription('The channel messages should be sent to')
          .addChannelOption((option) => option.setName('channel').setDescription('The channel messages should be send to').setRequired(true))
      )
      .addSubcommand((subcommand) => subcommand.setName('off').setDescription('Disable the Starboard module'))
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('antiscam')
      .setDescription('Configure the Anti Scam module')
      .addBooleanOption((option) => option.setName('toggle').setDescription('Enable/Disable Anti Scam module?').setRequired(true))
  );

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Configuration related commands',
      category: 'Moderation',
      options: data,
      userPerms: ['ManageGuild'],
      botPerms: ['ManageGuild']
    });
  }

  async run(interaction) {
    const subGroup = interaction.options.getSubcommandGroup();
    const subCommand = interaction.options.getSubcommand();

    // All Commands
    if (subCommand === 'all') {
      const home = new ButtonBuilder().setCustomId('home').setEmoji('🏠').setStyle(ButtonStyle.Success).setDisabled(true);
      const buttonAd = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Ad Prot').setCustomId('ads');
      const buttonScam = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Anti Scam').setCustomId('antiscam');
      const buttonAuto = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Autorole').setCustomId('autorole');
      const buttonBirth = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Birthday').setCustomId('birthday');
      const buttonDad = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Dad').setCustomId('dad');
      const buttonHaste = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Haste').setCustomId('haste');
      const buttonLog = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Logging').setCustomId('logging');
      const buttonRole = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Rolemenu').setCustomId('rolemenu');
      const buttonTick = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Tickets').setCustomId('tickets');
      const buttonWelc = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Welcome').setCustomId('welcome');
      const buttonStar = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Starboard').setCustomId('starboard');

      const row = new ActionRowBuilder().addComponents(home, buttonAd, buttonScam, buttonAuto, buttonBirth);
      const row2 = new ActionRowBuilder().addComponents(buttonDad, buttonHaste, buttonLog, buttonRole, buttonTick);
      const row3 = new ActionRowBuilder().addComponents(buttonWelc, buttonStar);

      const initial = new EmbedBuilder()
        .setAuthor({ name: `${interaction.user.tag}`, iconURL: interaction.user.avatarURL() })
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Config**`,
          value: '**◎** Click the corresponding button for which module you would like to configure.'
        });

      const m = await interaction.reply({ ephemeral: true, components: [row, row2, row3], embeds: [initial] });

      const filter = (but) => but.user.id !== this.client.user.id;

      const collector = m.createMessageComponentCollector({ filter, time: 15000 });

      collector.on('collect', async (b) => {
        collector.resetTimer();

        if (b.customId === 'home') {
          home.setDisabled(true);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonAd, buttonScam, buttonAuto, buttonBirth);
          const row2New = new ActionRowBuilder().addComponents(buttonDad, buttonHaste, buttonLog, buttonRole, buttonTick);
          const row3New = new ActionRowBuilder().addComponents(buttonWelc, buttonStar);

          await b.update({ embeds: [initial], components: [rowNew, row2New, row3New] });
          return;
        }

        if (b.customId === 'ads') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonAd, buttonScam, buttonAuto, buttonBirth);
          const row2New = new ActionRowBuilder().addComponents(buttonDad, buttonHaste, buttonLog, buttonRole, buttonTick);
          const row3New = new ActionRowBuilder().addComponents(buttonWelc, buttonStar);

          const ads = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Advert Protection:**
							\u3000\`/config adsprot <true/false>\` : Toggles Advert Protection`
          });

          await b.update({ embeds: [ads], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'antiscam') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonAd, buttonScam, buttonAuto, buttonBirth);
          const row2New = new ActionRowBuilder().addComponents(buttonDad, buttonHaste, buttonLog, buttonRole, buttonTick);
          const row3New = new ActionRowBuilder().addComponents(buttonWelc, buttonStar);

          const ads = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Anti Scam:**
							\u3000\`/config antiscam <true/false>\` : Toggles Anti Scam`
          });

          await b.update({ embeds: [ads], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'autorole') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonAd, buttonScam, buttonAuto, buttonBirth);
          const row2New = new ActionRowBuilder().addComponents(buttonDad, buttonHaste, buttonLog, buttonRole, buttonTick);
          const row3New = new ActionRowBuilder().addComponents(buttonWelc, buttonStar);

          const auto = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ AutoRole:**
							\u3000\`/config autorole role <@role>\` : Sets the role users are given when they join the guild
            \u3000\`/config autorole off\` : Disable the AutoRole module`
          });

          await b.update({ embeds: [auto], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'birthday') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonAd, buttonScam, buttonAuto, buttonBirth);
          const row2New = new ActionRowBuilder().addComponents(buttonDad, buttonHaste, buttonLog, buttonRole, buttonTick);
          const row3New = new ActionRowBuilder().addComponents(buttonWelc, buttonStar);

          const bday = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Birthday:**
							\u3000\`/config birthday channel <#channel>\` : Sets the channel where Birthday alerts are sent.
              \u3000\`/config birthday role <@role>\` : Sets the role that will be alerted.
					    \u3000\`/config birthday off\` : Disables the Birthday module.`
          });

          await b.update({ embeds: [bday], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'dad') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonAd, buttonScam, buttonAuto, buttonBirth);
          const row2New = new ActionRowBuilder().addComponents(buttonDad, buttonHaste, buttonLog, buttonRole, buttonTick);
          const row3New = new ActionRowBuilder().addComponents(buttonWelc, buttonStar);

          const dad = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Dad Bot:**
							\u3000\`/config dadbot <true/false>\` : Toggles the Dad Bot module`
          });

          await b.update({ embeds: [dad], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'hastebin') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonAd, buttonScam, buttonAuto, buttonBirth);
          const row2New = new ActionRowBuilder().addComponents(buttonDad, buttonHaste, buttonLog, buttonRole, buttonTick);
          const row3New = new ActionRowBuilder().addComponents(buttonWelc, buttonStar);

          const haste = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Hastebin:**
							\u3000\`/config haste <true/false>\` : Toggles the Hastebin URL blocker`
          });

          await b.update({ embeds: [haste], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'logging') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonAd, buttonScam, buttonAuto, buttonBirth);
          const row2New = new ActionRowBuilder().addComponents(buttonDad, buttonHaste, buttonLog, buttonRole, buttonTick);
          const row3New = new ActionRowBuilder().addComponents(buttonWelc, buttonStar);

          const log = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Logging:**
							\u3000\`/config logging channel <#channel>\` : Sets the Logging channel
              \u3000\`/config logging off\` : Disables the Logging channel`
          });

          await b.update({ embeds: [log], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'rolemenu') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonAd, buttonScam, buttonAuto, buttonBirth);
          const row2New = new ActionRowBuilder().addComponents(buttonDad, buttonHaste, buttonLog, buttonRole, buttonTick);
          const row3New = new ActionRowBuilder().addComponents(buttonWelc, buttonStar);

          const rlm = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Role Menu:**
							\u3000\`/config rolemenu add <@role>\` : Sets the Role Menu roles
							\u3000\`/config rolemenu remove <@role>\` : Removes a role from Role Menu
							\u3000\`/config rolemenu clear\` : Removes all roles from Role Menu`
          });

          await b.update({ embeds: [rlm], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'tickets') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonAd, buttonScam, buttonAuto, buttonBirth);
          const row2New = new ActionRowBuilder().addComponents(buttonDad, buttonHaste, buttonLog, buttonRole, buttonTick);
          const row3New = new ActionRowBuilder().addComponents(buttonWelc, buttonStar);

          const tck = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Tickets:**
							\u3000\`/config ticket category <#category>\` : Sets the Ticket category
							\u3000\`/config ticket channel <#channel>\` : Sets Ticket logging channel
							\u3000\`/config ticket role <@role>\` : Sets custom support role for Ticket module
              \u3000\`/config ticket off\` : Disables the Ticket module`
          });

          await b.update({ embeds: [tck], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'welcome') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonAd, buttonScam, buttonAuto, buttonBirth);
          const row2New = new ActionRowBuilder().addComponents(buttonDad, buttonHaste, buttonLog, buttonRole, buttonTick);
          const row3New = new ActionRowBuilder().addComponents(buttonWelc, buttonStar);

          const wlc = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Welcome:**
							\u3000 \`/config welcome image <url-to-image>\` : Sets the Welcome image
							\u3000 \`/config welcome channel <#channel>\` : Sets the Welcome channel
							\u3000 \`/config welcome off\` : Disables the Welcome module`
          });

          await b.update({ embeds: [wlc], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'starboard') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonAd, buttonScam, buttonAuto, buttonBirth);
          const row2New = new ActionRowBuilder().addComponents(buttonDad, buttonHaste, buttonLog, buttonRole, buttonTick);
          const row3New = new ActionRowBuilder().addComponents(buttonWelc, buttonStar);

          const str = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Starboard:**
							\u3000 \`/config starboard channel <#channel>\` : Sets the Star Board channel
              \u3000 \`/config starboard off\` : Disables the Star Board module`
          });
          await b.update({ embeds: [str], components: [rowNew, row2New, row3New] });
        }
      });

      collector.on('end', (_, reason) => {
        if (reason === 'time') {
          // Disable button and update message
          home.setDisabled(true);
          buttonAd.setDisabled(true);
          buttonScam.setDisabled(true);
          buttonAuto.setDisabled(true);
          buttonBirth.setDisabled(true);
          buttonDad.setDisabled(true);
          buttonHaste.setDisabled(true);
          buttonLog.setDisabled(true);
          buttonRole.setDisabled(true);
          buttonTick.setDisabled(true);
          buttonWelc.setDisabled(true);
          buttonStar.setDisabled(true);
          interaction.editReply({ components: [row, row2, row3] });
        }
      });
      return;
    }

    // Birthday Command
    if (subGroup === 'birthday') {
      const status = await BirthdayConfig.findOne({ GuildId: interaction.guild.id });

      const bChannel = interaction.options.getChannel('channel');
      const bRole = interaction.options.getRole('role');

      if (subCommand === 'off') {
        if (!status) {
          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Birthday function is already disabled!' });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Birthday function disabled!' });
        interaction.reply({ ephemeral: true, embeds: [embed] });

        await BirthdayConfig.deleteOne({ GuildId: interaction.guild.id });
        return;
      }

      if (bChannel) {
        if (bChannel.type !== ChannelType.GuildText) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** Please enter a valid **text** channel.'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (!status) {
          await new BirthdayConfig({
            GuildId: interaction.guild.id,
            ChannelId: bChannel.id
          }).save();
        } else {
          await BirthdayConfig.findOneAndUpdate(
            {
              GuildId: interaction.guild.id
            },
            {
              ChannelId: bChannel.id
            }
          );
        }

        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Config**`,
          value: `**◎ Success:** Birthday channel set to ${bChannel}`
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
      }

      if (bRole) {
        if (!status) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** Please set a channel before setting the role! You can do this by running: `/config birthday channel #channel`'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        await BirthdayConfig.findOneAndUpdate(
          {
            GuildId: interaction.guild.id
          },
          {
            Role: bRole.id
          }
        );

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Birthday Role updated to ${bRole}` });
        interaction.reply({ ephemeral: true, embeds: [embed] });
      }
    }

    // Rolemenu Command
    if (subGroup === 'rolemenu') {
      const rRole = interaction.options.getRole('role');

      const userHasPermission = interaction.member.permissions.has('ManageRoles');
      const botHasPermission = interaction.guild.members.me.permissions.has('ManageRoles');

      if (!userHasPermission || !botHasPermission) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Config**`,
          value: userHasPermission
            ? '**◎ Error:** I need the `Manage Roles` permission to use this command.'
            : '**◎ Error:** You need the `Manage Roles` permission to use this command.'
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (subCommand === 'add') {
        if (rRole.position >= interaction.member.roles.highest.position) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** You can not set a role that is higher than your highest.'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        // Fetch bot
        const botUser = interaction.guild.members.cache.get(this.client.user.id);

        if (rRole.position >= botUser.roles.highest.position) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** You can not set a role that is higher than my role.'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        const roleList = [];

        const foundRoleMenu = await RoleMenu.findOne({ GuildId: interaction.guild.id });

        if (!foundRoleMenu) {
          roleList.push(rRole.id);

          await new RoleMenu({
            GuildId: interaction.guild.id,
            RoleList: JSON.stringify(roleList)
          }).save();

          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Success:** Roles successfully set in the assignable role menu!\nYou can now rum `/rolemenu` to generate a menu.'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
        } else {
          const foundRoleList = JSON.parse(foundRoleMenu.RoleList);

          if (foundRoleList.length >= 25) {
            const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: '**◎ Error:** You can only have 25 roles!\nYou can remove roles with `/config rolemenu remove <@role>`'
            });
            interaction.reply({ ephemeral: true, embeds: [embed] });
            return;
          }

          if (foundRoleList.includes(rRole.id)) {
            const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: `**◎ Error:** ${rRole}, is already in the Role Menu!`
            });
            interaction.reply({ ephemeral: true, embeds: [embed] });
            return;
          }

          foundRoleList.push(rRole.id);

          // Check if new array is over 25 and return if so.
          if (foundRoleList.length >= 25) {
            const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: '**◎ Error:** You can only have 25 roles!\nYou can remove roles with `/config rolemenu remove <@role>`'
            });
            interaction.reply({ ephemeral: true, embeds: [embed] });
            return;
          }

          if (foundRoleMenu.RoleMenuId) {
            const activeMenu = JSON.parse(foundRoleMenu.RoleMenuId);

            if (activeMenu) {
              const ch = interaction.guild.channels.cache.get(activeMenu.ChannelId);

              ch.messages
                .fetch({ message: activeMenu.message })
                .then((ms) => {
                  const roleArray = JSON.parse(foundRoleMenu.RoleList);

                  const buttonsArr = [];
                  const rows = [];

                  for (const buttonObject of roleArray) {
                    const currentRoles = interaction.guild.roles.cache.get(buttonObject);
                    buttonsArr.push(
                      new ButtonBuilder().setCustomId(`rm-${currentRoles.id}`).setLabel(`${currentRoles.name}`).setStyle(ButtonStyle.Success)
                    );
                  }

                  buttonsArr.push(new ButtonBuilder().setCustomId(`rm-${rRole.id}`).setLabel(`${rRole.name}`).setStyle(ButtonStyle.Success));

                  for (const rowObject of chunkArrayInGroups(buttonsArr, 5)) {
                    rows.push(new ActionRowBuilder().addComponents(...rowObject));
                  }

                  const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
                    name: `**${this.client.user.username} - Config**`,
                    value: '**◎ Success:** Roles successfully set in the assignable role menu!\nYour current menu has been updated'
                  });
                  interaction.reply({ ephemeral: true, embeds: [embed] });

                  setTimeout(() => {
                    // I added this timeout because I couldn’t be bothered fixing, please don’t remove or I cry
                    const roleMenuEmbed = new EmbedBuilder()
                      .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
                      .setTitle('Assign a Role')
                      .setDescription('Select the role you wish to assign to yourself.');
                    ms.edit({ embeds: [roleMenuEmbed], components: [...rows] });
                  });
                }, 1000)
                .catch(() => {
                  const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
                    name: `**${this.client.user.username} - Config**`,
                    value:
                      '**◎ Success:** Roles successfully set in the assignable role menu!\n**However** I was unable to update the current rolemenu, you will have to run `/rolemenu` to create a menu again.'
                  });
                  interaction.reply({ ephemeral: true, embeds: [embed] });
                });
            }
          } else {
            const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: '**◎ Success:** Roles successfully set in the assignable role menu!\nYou can now rum `/rolemenu` to generate a menu.'
            });
            interaction.reply({ ephemeral: true, embeds: [embed] });
          }

          await RoleMenu.findOneAndUpdate(
            {
              GuildId: interaction.guild.id
            },
            {
              RoleList: JSON.stringify(foundRoleList)
            }
          );
        }
        return;
      }

      if (subCommand === 'remove') {
        const foundRoleMenu = await RoleMenu.findOne({ GuildId: interaction.guild.id });

        if (!foundRoleMenu) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** The roles for the menu have not been set yet.'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        const roleList = JSON.parse(foundRoleMenu.RoleList);

        if (roleList.includes(rRole.id)) {
          const index = roleList.indexOf(rRole.id);
          roleList.splice(index, 1);

          if (!roleList.length) {
            if (foundRoleMenu.RoleMenuId) {
              const activeMenu = JSON.parse(foundRoleMenu.RoleMenuId);

              if (activeMenu) {
                const ch = interaction.guild.channels.cache.get(activeMenu.ChannelId);

                ch.messages
                  .fetch({ message: activeMenu.message })
                  .then((ms) => {
                    ms.delete();
                    const embedA = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
                      name: `**${this.client.user.username} - Config**`,
                      value:
                        '**◎ Success:** Specified roles have successfully been removed from the Role Menu!\nSince no roles are present, I have removed the rolemenu.'
                    });
                    interaction.reply({ ephemeral: true, embeds: [embedA] });
                  })
                  .catch(() => {
                    const embedA = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
                      name: `**${this.client.user.username} - Config**`,
                      value:
                        '**◎ Error:** **◎ Success:** Specified roles have successfully been removed from the Role Menu!\nNo roles exist in the database, I was unable to delete the active role menu.'
                    });
                    interaction.reply({ ephemeral: true, embeds: [embedA] });
                  });
              }

              await RoleMenu.deleteOne({ GuildId: interaction.guild.id });
              return;
            }

            const embedA = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: '**◎ Success:** Specified roles have successfully been removed from the Role Menu!'
            });
            interaction.reply({ ephemeral: true, embeds: [embedA] });

            await RoleMenu.deleteOne({ GuildId: interaction.guild.id });
          } else {
            const embedA = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: '**◎ Success:** Specified roles have successfully been removed from the Role Menu!'
            });
            interaction.reply({ ephemeral: true, embeds: [embedA] });

            await RoleMenu.findOneAndUpdate(
              {
                GuildId: interaction.guild.id
              },
              {
                RoleList: JSON.stringify(roleList)
              }
            );
          }
        } else {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Error:** ${rRole} does not exist within the active Role Menu!`
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (foundRoleMenu.RoleMenuId) {
          const activeMenu = JSON.parse(foundRoleMenu.RoleMenuId);

          if (activeMenu) {
            const ch = interaction.guild.channels.cache.get(activeMenu.ChannelId);

            ch.messages
              .fetch({ message: activeMenu.message })
              .then((ms) => {
                // Update the message with the new array of roles
                const buttonsArr = [];
                const rows = [];

                for (const buttonObject of roleList) {
                  const currentRoles = interaction.guild.roles.cache.get(buttonObject);
                  buttonsArr.push(
                    new ButtonBuilder().setCustomId(`rm-${currentRoles.id}`).setLabel(`${currentRoles.name}`).setStyle(ButtonStyle.Success)
                  );
                }

                buttonsArr.push(new ButtonBuilder().setCustomId(`rm-${rRole.id}`).setLabel(`${rRole.name}`).setStyle(ButtonStyle.Success));

                for (const rowObject of chunkArrayInGroups(buttonsArr, 5)) {
                  rows.push(new ActionRowBuilder().addComponents(...rowObject));
                }

                const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
                  name: `**${this.client.user.username} - Config**`,
                  value: '**◎ Success:** Specified roles have successfully been removed from the Role Menu!'
                });
                interaction.reply({ ephemeral: true, embeds: [embed] });

                setTimeout(() => {
                  // I added this timeout because I couldn’t be bothered fixing, please don’t remove or I cry
                  const roleMenuEmbed = new EmbedBuilder()
                    .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
                    .setTitle('Assign a Role')
                    .setDescription('Select the role you wish to assign to yourself.');
                  ms.edit({ embeds: [roleMenuEmbed], components: [...rows] });
                });
              }, 1000)
              .catch(() => {
                const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
                  name: `**${this.client.user.username} - Config**`,
                  value:
                    '**◎ Error:** Specified roles have successfully been removed from the rolemene. However, I was unable to update the existing menu, you will have to run `/rolemenu` again to reset the menu.'
                });
                interaction.reply({ ephemeral: true, embeds: [embed] });
              });
          }
        }
        return;
      }

      if (subCommand === 'clear') {
        const foundRoleMenu = await RoleMenu.findOne({ GuildId: interaction.guild.id });
        if (!foundRoleMenu) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** The roles for the menu have not been set yet.'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        // delete the rolemenu message if it exists
        if (foundRoleMenu.RoleMenuId) {
          const activeMenu = JSON.parse(foundRoleMenu.RoleMenuId);

          if (activeMenu) {
            const ch = interaction.guild.channels.cache.get(activeMenu.ChannelId);

            try {
              ch.messages.fetch({ message: activeMenu.message }).then((ms) => {
                ms.delete();
              });

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Rolemenu has been cleared!' });
              interaction.reply({ ephemeral: true, embeds: [embed] });
            } catch {
              const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value: '**◎ Error:** Rolemenu has been cleared, however I was unable to delete the existing menu.'
              });
              interaction.reply({ ephemeral: true, embeds: [embed] });
            }
          }
        }

        await RoleMenu.deleteOne({ GuildId: interaction.guild.id });

        if (!foundRoleMenu.RoleMenuId) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Success:** All roles have successfully been cleared from the rolemenu!'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
        }
      }
    }

    // Hastebin Command
    if (subCommand === 'hastebin') {
      // preparing count
      const status = await Hastebin.findOne({ GuildId: interaction.guild.id });

      const subType = interaction.options.getBoolean('toggle');

      if (subType === true) {
        // if already on
        if (status) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** Hastebin URL blocker is already enabled on this guild! To disable it, please use `/config haste False`'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        await new Hastebin({
          GuildId: interaction.guild.id,
          Status: true
        }).save();

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Hastebin URL blocker was enabled.' });
        interaction.reply({ ephemeral: true, embeds: [embed] });

        // if args = off
      } else if (subType === false) {
        // if already off
        if (!status) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** Hastebin URL blocker is not enabled on this guild! To activate it, please use `/config haste True`'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        await Hastebin.deleteOne({ GuildId: interaction.guild.id });

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Hastebin URL blocker was disabled!' });
        interaction.reply({ ephemeral: true, embeds: [embed] });
      }
    }

    // Dadbot Command
    if (subCommand === 'dadbot') {
      // preparing count
      const status = await Dad.findOne({ GuildId: interaction.guild.id });

      const subType = interaction.options.getBoolean('toggle');

      if (subType === true) {
        // if already on
        if (status) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** Dad Bot is already enabled on this guild! To disable it, please use `/config dadbot False`'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        await new Dad({
          GuildId: interaction.guild.id,
          Status: true
        }).save();

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Dad Bot was enabled.' });
        interaction.reply({ ephemeral: true, embeds: [embed] });

        // if args = off
      } else if (subType === false) {
        // if already off
        if (!status) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** Dad Bot is not enabled on this guild! To activate it, please use `/config dadbot True`'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        await Dad.deleteOne({ GuildId: interaction.guild.id });

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Dad Bot was disabled!' });
        interaction.reply({ ephemeral: true, embeds: [embed] });
      }
    }

    // Adsprot Command
    if (subCommand === 'adsprot') {
      const antiscam = await AntiScam.findOne({ GuildId: interaction.guild.id });

      if (antiscam) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Config**`,
          value:
            '**◎ Error:** Anti Scam is enabled, you can only only have either `Anti Scam` **OR** `Ads Protection` enabled! To deactivate it, please use `/config antiscam False`'
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      // preparing count
      const status = await AdsProtection.findOne({ GuildId: interaction.guild.id });

      const subType = interaction.options.getBoolean('toggle');

      if (subType === true) {
        // if already on
        if (status) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** Ads Protection is already enabled on this guild! To disable it, please use `/config adsprot False`'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        await new AdsProtection({
          GuildId: interaction.guild.id,
          Status: true
        }).save();

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Ads Protection was enabled.' });
        interaction.reply({ ephemeral: true, embeds: [embed] });

        // if args = off
      } else if (subType === false) {
        // if already off
        if (!status) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** Ads Protection is not enabled on this guild! To activate it, please use `/config adsprot True`'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        await AdsProtection.deleteOne({ GuildId: interaction.guild.id });

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Ads Protection was disabled!' });
        interaction.reply({ ephemeral: true, embeds: [embed] });
      }
    }

    // Anti Scam Command
    if (subCommand === 'antiscam') {
      const adsprot = await AdsProtection.findOne({ GuildId: interaction.guild.id });

      if (adsprot) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Config**`,
          value:
            '**◎ Error:** Ads Protection is enabled, you can only only have either `Anti Scam` **OR** `Ads Protection` enabled! To deactivate it, please use `/config adsprot False`'
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      // preparing count
      const status = await AntiScam.findOne({ GuildId: interaction.guild.id });

      const subType = interaction.options.getBoolean('toggle');

      if (subType === true) {
        // if already on
        if (status) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** Anti Scam is already enabled on this guild! To disable it, please use `/config antiscam False`'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        await new AntiScam({
          GuildId: interaction.guild.id,
          Status: true
        }).save();

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Anti Scam was enabled.' });
        interaction.reply({ ephemeral: true, embeds: [embed] });

        // if args = off
      } else if (subType === false) {
        // if already off
        if (!status) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** Anti Scam is not enabled on this guild! To activate it, please use `/config antiscam True`'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        await AntiScam.deleteOne({ GuildId: interaction.guild.id });

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Anti Scam was disabled!' });
        interaction.reply({ ephemeral: true, embeds: [embed] });
      }
    }

    // Autorole Command
    if (subGroup === 'autorole') {
      const status = await AutoRole.findOne({ GuildId: interaction.guild.id });

      const role = interaction.options.getRole('role');

      if (subCommand === 'off') {
        if (!status) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** AutoRole is not enabled on this guild! To enable it, please use `/config autorole @role`'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        await AutoRole.deleteOne({ GuildId: interaction.guild.id });

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Autorole disabled!' });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      const userHasPermission = interaction.member.permissions.has('ManageRoles');
      const botHasPermission = interaction.guild.members.me.permissions.has('ManageRoles');

      if (!userHasPermission || !botHasPermission) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Config**`,
          value: userHasPermission
            ? '**◎ Error:** I need the `Manage Roles` permission to use this command.'
            : '**◎ Error:** You need the `Manage Roles` permission to use this command.'
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (role.position >= interaction.member.roles.highest.position) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Config**`,
          value: '**◎ Error:** You can not set a role that is higher than your highest.'
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      // Fetch bot
      const botUser = interaction.guild.members.cache.get(this.client.user.id);

      if (role.position >= botUser.roles.highest.position) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Config**`,
          value: '**◎ Error:** You can not set a role that is higher than my role.'
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (status) {
        await AutoRole.findOneAndUpdate(
          {
            GuildId: interaction.guild.id
          },
          {
            Role: role.id
          }
        );

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Autorole updated to ${role}!` });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      await new AutoRole({
        GuildId: interaction.guild.id,
        Role: role.id
      }).save();

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Autorole set to ${role}!` });
      interaction.reply({ ephemeral: true, embeds: [embed] });
    }

    // Logging command
    if (subGroup === 'logging') {
      if (!interaction.member.guild.members.me.permissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Config**`,
          value: '**◎ Error:** I need the permission `View Audit Log` for this command!'
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      const status = await Logging.findOne({ GuildId: interaction.guild.id });

      const lchan = interaction.options.getChannel('channel');

      if (subCommand === 'off') {
        // to turn logging off
        if (!status) {
          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Logging is already disabled!' });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Logging disabled!' });
        interaction.reply({ ephemeral: true, embeds: [embed] });

        await Logging.deleteOne({ GuildId: interaction.guild.id });
        return;
      }

      if (lchan.type !== ChannelType.GuildText) {
        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Config**`,
          value: '**◎ Error:** Please select a valid **text** channel.'
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      if (!status) {
        await new Logging({
          GuildId: interaction.guild.id,
          ChannelId: lchan.id
        }).save();

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Logging set to ${lchan}` });
        interaction.reply({ ephemeral: true, embeds: [embed] });
        return;
      }

      await Logging.findOneAndUpdate(
        {
          GuildId: interaction.guild.id
        },
        {
          ChannelId: lchan.id
        }
      );

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Logging updated to ${lchan}` });
      interaction.reply({ ephemeral: true, embeds: [embed] });
    }

    // Ticket Command
    if (subGroup === 'ticket') {
      const status = await TicketConfig.findOne({ GuildId: interaction.guild.id });

      if (subCommand === 'off') {
        if (!status) {
          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Tickets are already disabled!' });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Tickets disabled!' });
        interaction.reply({ ephemeral: true, embeds: [embed] });

        await TicketConfig.deleteOne({ GuildId: interaction.guild.id });
        return;
      }

      if (subCommand === 'category') {
        const category = interaction.options.getChannel('category');

        if (category.type !== ChannelType.GuildCategory) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** Please select a valid **category**.'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (!status) {
          await new TicketConfig({
            GuildId: interaction.guild.id,
            Category: category.id
          }).save();

          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Success:** Ticket Category set to \`${category.name}\``
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        await TicketConfig.findOneAndUpdate(
          {
            GuildId: interaction.guild.id
          },
          {
            Category: category.id
          }
        );

        const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Config**`,
          value: `**◎ Success:** Ticket Category updated to \`${category.name}\``
        });
        interaction.reply({ ephemeral: true, embeds: [embed] });
      }

      if (subCommand === 'channel') {
        const lchan = interaction.options.getChannel('channel');

        if (lchan.type !== ChannelType.GuildText) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** Please select a valid **text** channel.'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (!status) {
          await new TicketConfig({
            GuildId: interaction.guild.id,
            ChannelId: lchan.id
          }).save();

          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Ticket Logging set to ${lchan}` });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        await TicketConfig.findOneAndUpdate(
          {
            GuildId: interaction.guild.id
          },
          {
            LogChannel: lchan.id
          }
        );

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Ticket Logging updated to ${lchan}` });
        interaction.reply({ ephemeral: true, embeds: [embed] });
      }

      if (subCommand === 'role') {
        const suppRole = interaction.options.getRole('role');

        if (!status) {
          await new TicketConfig({
            GuildId: interaction.guild.id,
            Role: suppRole.id
          }).save();

          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Support Role updated to ${suppRole}` });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        await TicketConfig.findOneAndUpdate(
          {
            GuildId: interaction.guild.id
          },
          {
            Role: suppRole.id
          }
        );

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Support Role updated to ${suppRole}` });
        interaction.reply({ ephemeral: true, embeds: [embed] });
      }
    }

    // Welcome Command
    if (subGroup === 'welcome') {
      const status = await Welcome.findOne({ GuildId: interaction.guild.id });

      if (subCommand === 'off') {
        if (!status) {
          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Welcome is already disabled!' });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Welcome disabled!' });
        interaction.reply({ ephemeral: true, embeds: [embed] });

        await Welcome.deleteOne({ GuildId: interaction.guild.id });
        return;
      }

      if (subCommand === 'image') {
        const subImage = interaction.options.getString('image');

        const urlExtension = subImage.substring(subImage.lastIndexOf('.') + 1);
        const validExtensions = ['jpg', 'jpeg', 'png'];

        if (!validExtensions.includes(urlExtension)) {
          const invalidExt = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Error:** \`.${urlExtension}\` is not a valid image type!\n\n**Acceptable files:**\n\`${validExtensions.join(', ')}\``
          });
          interaction.reply({ ephemeral: true, embeds: [invalidExt] });
          return;
        }

        const urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;

        if (!urlRegex.test(subImage)) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** Please enter a valid URL, the URL must be absolute! An example of an absolute URL would be: https://www.google.com'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        await fetch(subImage).then(async (res) => {
          if (res.ok) {
            if (!status) {
              const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value:
                  '**◎ Error:** You must enable the welcome module first! You can do this by running the following command. `/config welcome #channel`'
              });
              interaction.reply({ ephemeral: true, embeds: [embed] });
            } else {
              try {
                await Canvas.loadImage(subImage);
              } catch {
                const invalidExt = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
                  name: `**${this.client.user.username} - Config**`,
                  value: `**◎ Error:** I was unable to process \`${subImage}\`\nIs it a valid image?`
                });
                interaction.reply({ ephemeral: true, embeds: [invalidExt] });
                return;
              }

              await Welcome.findOneAndUpdate(
                {
                  GuildId: interaction.guild.id
                },
                {
                  Image: subImage
                }
              );

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
                .setImage(subImage)
                .addFields({
                  name: `**${this.client.user.username} - Config**`,
                  value: '**◎ Success:** Image has been updated to the following.'
                });
              interaction.reply({ ephemeral: true, embeds: [embed] });
            }
          } else {
            const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value:
                '**◎ Error:** Please enter a valid image URL! The end of the URL must end with one of the supported extensions. (`.jpg, .jpeg, .png`)'
            });
            interaction.reply({ ephemeral: true, embeds: [embed] });
          }
        });

        return;
      }

      if (subCommand === 'channel') {
        const lchan = interaction.options.getChannel('channel');

        if (lchan.type !== ChannelType.GuildText) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** Please select a valid **text** channel.'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        if (!status) {
          await new Welcome({
            GuildId: interaction.guild.id,
            ChannelId: lchan.id
          }).save();

          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Welcome channel is now set to ${lchan}` });
          interaction.reply({ ephemeral: true, embeds: [embed] });
        } else {
          await Welcome.findOneAndUpdate(
            {
              GuildId: interaction.guild.id
            },
            {
              ChannelId: lchan.id
            }
          );

          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Welcome channel updated to ${lchan}` });
          interaction.reply({ ephemeral: true, embeds: [embed] });
        }
      }
    }

    // Starboard Command
    if (subGroup === 'starboard') {
      const status = await StarBoard.findOne({ GuildId: interaction.guild.id });

      if (subCommand === 'off') {
        if (!status) {
          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Starboard is already disabled!' });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Starboard disabled!' });
        interaction.reply({ ephemeral: true, embeds: [embed] });

        await StarBoard.deleteOne({ GuildId: interaction.guild.id });
        return;
      }

      if (subCommand === 'channel') {
        const lchan = interaction.options.getChannel('channel');

        if (lchan.type !== ChannelType.GuildText) {
          const embed = new EmbedBuilder().setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** Please enter a valid **text** channel.'
          });
          interaction.reply({ ephemeral: true, embeds: [embed] });
          return;
        }
        if (!status) {
          await new StarBoard({
            GuildId: interaction.guild.id,
            ChannelId: lchan.id
          }).save();

          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Starboard set to ${lchan}` });
          interaction.reply({ embeds: [embed] });
          return;
        }

        await StarBoard.findOneAndUpdate(
          {
            GuildId: interaction.guild.id
          },
          {
            ChannelId: lchan.id
          }
        );

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(interaction.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Starboard updated to ${lchan}` });
        interaction.reply({ ephemeral: true, embeds: [embed] });
      }
    }

    function chunkArrayInGroups(arr, size) {
      const result = [];
      let pos = 0;
      while (pos < arr.length) {
        result.push(arr.slice(pos, pos + size));
        pos += size;
      }
      return result;
    }
  }
};

export default SlashCommandF;
