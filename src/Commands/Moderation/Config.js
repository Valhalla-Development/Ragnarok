/* eslint-disable no-restricted-syntax */
import { EmbedBuilder, PermissionsBitField, ButtonBuilder, ActionRowBuilder, ChannelType, ButtonStyle } from 'discord.js';
import SQLite from 'better-sqlite3';
import fetch from 'node-fetch';
import Canvas from 'canvas';
import Command from '../../Structures/Command.js';

const db = new SQLite('./Storage/DB/db.sqlite');

const comCooldown = new Set();
const comCooldownSeconds = 10;

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      aliases: ['conf'],
      description: 'Contains multiple commands to configure the bot.',
      category: 'Moderation',
      usage: '[sub-command]',
      userPerms: ['ManageGuild'],
      botPerms: ['ManageGuild']
    });
  }

  async run(message, args) {
    const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);

    const { prefix } = prefixgrab;

    if (args[0]) {
      if (comCooldown.has(message.author.id)) {
        comCooldown.delete(message.author.id);
      }
    }

    if (comCooldown.has(message.author.id)) {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Please only run this command once.' });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    // config help
    if (args[0] === undefined) {
      const home = new ButtonBuilder().setCustomId('home').setEmoji('🏠').setStyle(ButtonStyle.Success).setDisabled(true);

      const buttonA = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Ad Prot').setCustomId('ads');

      const buttonB = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Autorole').setCustomId('autorole');

      const buttonC = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Birthday').setCustomId('birthday');

      const buttonD = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Dad').setCustomId('dad');

      const buttonE = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Haste').setCustomId('haste');

      const buttonG = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Level').setCustomId('level');

      const buttonH = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Logging').setCustomId('logging');

      const buttonL = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Prefix').setCustomId('prefix');

      const buttonM = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Rolemenu').setCustomId('rolemenu');

      const buttonN = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Tickets').setCustomId('tickets');

      const buttonO = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Welcome').setCustomId('welcome');

      const buttonP = new ButtonBuilder().setStyle(ButtonStyle.Primary).setLabel('Starboard').setCustomId('starboard');

      const row = new ActionRowBuilder().addComponents(home, buttonA, buttonB, buttonC, buttonD);

      const row2 = new ActionRowBuilder().addComponents(buttonE, buttonG, buttonH, buttonL, buttonM);

      const row3 = new ActionRowBuilder().addComponents(buttonN, buttonO, buttonP);

      const initial = new EmbedBuilder()
        .setAuthor({ name: `${message.author.tag}`, iconURL: message.author.avatarURL() })
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({
          name: `**${this.client.user.username} - Config**`,
          value: '**◎** Click the corresponding button for which module you would like to configure.'
        });

      const m = await message.channel.send({ components: [row, row2, row3], embeds: [initial] });

      const filter = (but) => but.user.id !== this.client.user.id;

      const collector = m.createMessageComponentCollector({ filter, time: 15000 });

      if (!comCooldown.has(message.author.id)) {
        comCooldown.add(message.author.id);
      }
      setTimeout(() => {
        if (comCooldown.has(message.author.id)) {
          comCooldown.delete(message.author.id);
        }
      }, comCooldownSeconds * 1000);

      collector.on('collect', async (b) => {
        if (b.user.id !== message.author.id) {
          const wrongUser = new EmbedBuilder()
            .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Only the command executor can select an option!' });
          b.reply({ embeds: [wrongUser], ephemeral: true });
          return;
        }

        collector.resetTimer();

        if (b.customId === 'home') {
          home.setDisabled(true);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonA, buttonB, buttonC, buttonD);

          const row2New = new ActionRowBuilder().addComponents(buttonE, buttonG, buttonH, buttonL, buttonM);

          const row3New = new ActionRowBuilder().addComponents(buttonN, buttonO, buttonP);

          await b.update({ embeds: [initial], components: [rowNew, row2New, row3New] });
          return;
        }

        if (b.customId === 'ads') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonA, buttonB, buttonC, buttonD);

          const row2New = new ActionRowBuilder().addComponents(buttonE, buttonG, buttonH, buttonL, buttonM);

          const row3New = new ActionRowBuilder().addComponents(buttonN, buttonO, buttonP);

          const ads = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Advert Protection:**
							\u3000\`${prefix}config adsprot <on/off>\` : Toggles advert protection`
          });

          await b.update({ embeds: [ads], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'autorole') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonA, buttonB, buttonC, buttonD);

          const row2New = new ActionRowBuilder().addComponents(buttonE, buttonG, buttonH, buttonL, buttonM);

          const row3New = new ActionRowBuilder().addComponents(buttonN, buttonO, buttonP);

          const auto = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ AutoRole:**
							\u3000\`${prefix}config autorole <@role>\` : Sets the role users are given when they join the guild`
          });

          await b.update({ embeds: [auto], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'birthday') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonA, buttonB, buttonC, buttonD);

          const row2New = new ActionRowBuilder().addComponents(buttonE, buttonG, buttonH, buttonL, buttonM);

          const row3New = new ActionRowBuilder().addComponents(buttonN, buttonO, buttonP);

          const bday = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Birthday:**
							\u3000\`${prefix}config birthday channel <#channel>\` : Sets the channel where birthday alerts are sent.
					        \u3000\`${prefix}config birthday role [@role]\` : Sets the (optional) role is pinged when it is someones birthday.`
          });

          await b.update({ embeds: [bday], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'dad') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonA, buttonB, buttonC, buttonD);

          const row2New = new ActionRowBuilder().addComponents(buttonE, buttonG, buttonH, buttonL, buttonM);

          const row3New = new ActionRowBuilder().addComponents(buttonN, buttonO, buttonP);

          const dad = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Dad Bot:**
							\u3000\`${prefix}config dadbot <on/off>\` : Toggles the Dad bot module`
          });

          await b.update({ embeds: [dad], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'haste') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonA, buttonB, buttonC, buttonD);

          const row2New = new ActionRowBuilder().addComponents(buttonE, buttonG, buttonH, buttonL, buttonM);

          const row3New = new ActionRowBuilder().addComponents(buttonN, buttonO, buttonP);

          const haste = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Hastebin:**
							\u3000\`${prefix}config haste url <on/off>\` : Toggles the Hastebin URL blocker`
          });

          await b.update({ embeds: [haste], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'level') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonA, buttonB, buttonC, buttonD);

          const row2New = new ActionRowBuilder().addComponents(buttonE, buttonG, buttonH, buttonL, buttonM);

          const row3New = new ActionRowBuilder().addComponents(buttonN, buttonO, buttonP);

          const lvl = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Level System:**
							\u3000\`${prefix}config level <enable/disable>\` : Toggles the Level module`
          });

          await b.update({ embeds: [lvl], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'logging') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonA, buttonB, buttonC, buttonD);

          const row2New = new ActionRowBuilder().addComponents(buttonE, buttonG, buttonH, buttonL, buttonM);

          const row3New = new ActionRowBuilder().addComponents(buttonN, buttonO, buttonP);

          const log = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Logging:**
							\u3000\`${prefix}config logging <#channel/off>\` : Sets/disables the logging channel`
          });

          await b.update({ embeds: [log], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'prefix') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonA, buttonB, buttonC, buttonD);

          const row2New = new ActionRowBuilder().addComponents(buttonE, buttonG, buttonH, buttonL, buttonM);

          const row3New = new ActionRowBuilder().addComponents(buttonN, buttonO, buttonP);

          const prf = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Prefix:**
							\u3000\`${prefix}config prefix <prefix>\` : Sets the guild prefix`
          });

          await b.update({ embeds: [prf], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'rolemenu') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonA, buttonB, buttonC, buttonD);

          const row2New = new ActionRowBuilder().addComponents(buttonE, buttonG, buttonH, buttonL, buttonM);

          const row3New = new ActionRowBuilder().addComponents(buttonN, buttonO, buttonP);

          const rlm = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Role Menu:**
							\u3000\`${prefix}config rolemenu add <@role>\` : Sets the rolemenu roles
							\u3000\`${prefix}config rolemenu remove <@role>\` : Removes a role from rolemenu
							\u3000\`${prefix}config rolemenu clear\` : Removes all roles from rolemenu`
          });

          await b.update({ embeds: [rlm], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'tickets') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonA, buttonB, buttonC, buttonD);

          const row2New = new ActionRowBuilder().addComponents(buttonE, buttonG, buttonH, buttonL, buttonM);

          const row3New = new ActionRowBuilder().addComponents(buttonN, buttonO, buttonP);

          const tck = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Tickets:**
							\u3000\`${prefix}config ticket cat <cat name>\` : Sets the ticket category
							\u3000\`${prefix}config ticket log <#channel>\` : Enables ticket logging
							\u3000\`${prefix}config ticket role <@role>\` : Sets custom support role for ticket system`
          });

          await b.update({ embeds: [tck], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'welcome') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonA, buttonB, buttonC, buttonD);

          const row2New = new ActionRowBuilder().addComponents(buttonE, buttonG, buttonH, buttonL, buttonM);

          const row3New = new ActionRowBuilder().addComponents(buttonN, buttonO, buttonP);

          const wlc = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Welcome:**
							\u3000 \`${prefix}config welcome channel <#channel>\` : Sets the welcome channel
							\u3000 \`${prefix}config welcome channel off\` : Disables the welcome message
							\u3000 \`${prefix}config welcome image <url-to-image>\` : Sets custom welcome image
							\u3000 \`${prefix}config welcome image off\` : Disables the custom welcome image`
          });

          await b.update({ embeds: [wlc], components: [rowNew, row2New, row3New] });
          return;
        }
        if (b.customId === 'starboard') {
          home.setDisabled(false);

          const rowNew = new ActionRowBuilder().addComponents(home, buttonA, buttonB, buttonC, buttonD);

          const row2New = new ActionRowBuilder().addComponents(buttonE, buttonG, buttonH, buttonL, buttonM);

          const row3New = new ActionRowBuilder().addComponents(buttonN, buttonO, buttonP);

          const str = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: `**◎ Starboard:**
							\u3000 \`${prefix}config starboard <#channel/off>\` : Sets/disables the Starboard channel`
          });
          await b.update({ embeds: [str], components: [rowNew, row2New, row3New] });
        }
      });

      collector.on('end', (_, reason) => {
        if (comCooldown.has(message.author.id)) {
          comCooldown.delete(message.author.id);
        }

        if (reason === 'time') {
          this.client.utils.messageDelete(m, 0);
          this.client.utils.messageDelete(message, 0);
        }
      });
      return;
    }

    if (args[0]) {
      const commandList = [
        'adsprot',
        'autorole',
        'birthday',
        'dadbot',
        'haste',
        'level',
        'logging',
        'prefix',
        'rolemenu',
        'ticket',
        'welcome',
        'starboard'
      ];
      // Check if args[0] is a command
      if (!commandList.includes(args[0].toLowerCase())) {
        this.client.utils.messageDelete(message, 10000);

        const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Config**`,
          value: `**◎ Error:** Unknown config: \`${args[0]}\`\nRun \`${prefix}config\` to see all available configurations.`
        });
        message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }

      // Birthday config
      if (args[0] === 'birthday') {
        this.client.getTable = db.prepare('SELECT * FROM birthdayConfig WHERE guildid = ?');

        let status;
        if (message.guild.id) {
          status = this.client.getTable.get(message.guild.id);

          if (args[1] === undefined) {
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: `**◎ Error:** Available options are:\n\`${prefix}config birthday channel <#channel>\` : Sets the channel where birthday alerts are sent.\n\`${prefix}config birthday role [@role]\` : Sets the (optional) role is pinged when it is someones birthday.\nor \`${prefix}config birthday off\``
            });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }

          if (args[1] === 'off') {
            if (!status) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Birthday function is already disabled!' });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Birthday function disabled!' });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            db.prepare('DELETE FROM birthdayConfig WHERE guildid = ?').run(message.guild.id);
            return;
          }

          if (args[1] === 'channel') {
            const lchan = message.mentions.channels.first();

            if (args[2] === undefined) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Please mention a channel!' });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            if (!lchan) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value: `**◎ Error:** Ensure you are tagging a valid channel, I had difficulty locating ${lchan}`
              });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            } else if (!status) {
              const insert = db.prepare('INSERT INTO birthdayConfig (guildid, channel) VALUES (@guildid, @channel);');
              insert.run({
                guildid: `${message.guild.id}`,
                channel: `${lchan.id}`
              });
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Birthday channel is now set to ${lchan}` });
              message.channel.send({ embeds: [embed] });
            } else {
              const update = db.prepare('UPDATE birthdayConfig SET channel = (@channel) WHERE guildid = (@guildid);');
              update.run({
                guildid: `${message.guild.id}`,
                channel: `${lchan.id}`
              });
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Birthday channel updated to ${lchan}` });
              message.channel.send({ embeds: [embed] });
            }
          }

          if (args[1] === 'role') {
            if (!status) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value: `**◎ Error:** Please set a channel before setting the role! You can do this by running: \`${prefix}config birthday channel #channel\``
              });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            const role = message.mentions.roles.first();

            if (!role) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** A role must be mentioned' });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            const update = db.prepare('UPDATE birthdayConfig SET role = (@role) WHERE guildid = (@guildid);');
            update.run({
              guildid: `${message.guild.id}`,
              role: `${role.id}`
            });

            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Birthday Role updated to ${role}` });
            message.channel.send({ embeds: [embed] });
          }
        }
      }

      // Level toggle
      if (args[0] === 'level') {
        this.client.getTable = db.prepare('SELECT * FROM level WHERE guildid = ?');

        let status;
        if (message.guild.id) {
          status = this.client.getTable.get(message.guild.id);

          if (args[1] === undefined) {
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: `**◎ Error:** Available options are: \`${prefix}config level enable\` or \`${prefix}config level disable\``
            });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }

          if (args[1] === 'disable') {
            if (status) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Level system is already disabled!' });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Level system disabled!' });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            const insert = db.prepare('INSERT INTO level (guildid, status) VALUES (@guildid, @status);');
            insert.run({
              guildid: `${message.guild.id}`,
              status: 'disabled'
            });
            return;
          }
          if (args[1] === 'enable') {
            if (!status) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Level system is already enabled!' });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Level system enabled!' });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            db.prepare('DELETE FROM level WHERE guildid = ?').run(message.guild.id);
            return;
          }
        }
      }

      // Rolemenu Command
      if (args[0] === 'rolemenu') {
        // Rolemenu Config
        if (args[1] === 'add') {
          const roleList = [];
          if (message.mentions.roles.size <= 0) {
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: '**◎ Error:** You must mention a role to remove from the menu.'
            });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }

          const foundRoleMenu = db.prepare(`SELECT * FROM rolemenu WHERE guildid=${message.guild.id}`).get();
          if (!foundRoleMenu) {
            message.mentions.roles.forEach((role) => {
              roleList.push(role.id);
            });

            const newRoleMenu = db.prepare('INSERT INTO rolemenu (guildid, roleList) VALUES (@guildid, @roleList);');
            newRoleMenu.run({
              guildid: `${message.guild.id}`,
              roleList: JSON.stringify(roleList)
            });

            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: `**◎ Success:** Roles successfully set in the assignable role menu!\nYou can now rum \`${prefix}rolemenu\` to create a menu.`
            });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          } else {
            const fetchList = JSON.parse(foundRoleMenu.roleList);
            const foundRoleList = JSON.parse(foundRoleMenu.roleList);

            if (foundRoleList.length >= 25) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value: `**◎ Error:** You can only have 25 roles!\nYou can remove roles with \`${prefix}config rolemenu remove <@role>\``
              });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            const mentions = message.mentions.roles.map((role) => ({ name: role.name, id: role.id }));

            let msg = '';

            mentions.forEach((role) => {
              if (!foundRoleList.includes(role.id)) {
                foundRoleList.push(role.id);
              } else {
                msg += `<@&${role}>\n`;
              }
            });

            // eslint-disable-next-line no-inner-declarations
            function haveSameData(obj1, obj2) {
              const obj1Length = Object.keys(obj1).length;
              const obj2Length = Object.keys(obj2).length;

              if (obj1Length === obj2Length) {
                return Object.keys(obj1).every(
                  // eslint-disable-next-line no-prototype-builtins
                  (key) => obj2.hasOwnProperty(key) && obj2[key] === obj1[key]
                );
              }
              return false;
            }

            // Check if new array is over 25 and return if so.
            if (foundRoleList.length >= 25) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value: `**◎ Error:** You can only have 25 roles!\nYou can remove roles with \`${prefix}config rolemenu remove <@role>\``
              });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            if (haveSameData(fetchList, roleList)) {
              if (msg !== '') {
                this.client.utils.messageDelete(message, 10000);

                const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                  name: `**${this.client.user.username} - Config**`,
                  value: `**◎ Error:** The following roles are **already** in the active rolemenu:\n${msg}`
                });
                message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              }
              return;
            }

            if (foundRoleMenu.activeRoleMenuID) {
              const activeMenu = JSON.parse(foundRoleMenu.activeRoleMenuID);

              if (activeMenu) {
                const ch = message.guild.channels.cache.get(activeMenu.channel);

                try {
                  ch.messages.fetch({ message: activeMenu.message }).then((ms) => {
                    const roleArray = JSON.parse(foundRoleMenu.roleList);

                    const row = new ActionRowBuilder();

                    for (const buttonObject of roleArray) {
                      const currentRoles = message.guild.roles.cache.get(buttonObject);

                      row.addComponents(
                        new ButtonBuilder().setCustomId(`rm-${currentRoles.id}`).setLabel(`${currentRoles.name}`).setStyle(ButtonStyle.Success)
                      );
                    }

                    mentions.forEach((role) => {
                      row.addComponents(new ButtonBuilder().setCustomId(`rm-${role.id}`).setLabel(`${role.name}`).setStyle(ButtonStyle.Success));
                    });

                    setTimeout(() => {
                      // I added this timeout because I couldn’t be bothered fixing, please don’t remove or I cry
                      const roleMenuEmbed = new EmbedBuilder()
                        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                        .setTitle('Assign a Role')
                        .setDescription('Select the role you wish to assign to yourself.');
                      ms.edit({ embeds: [roleMenuEmbed], components: [row] });
                    });
                  }, 1000);

                  const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                    name: `**${this.client.user.username} - Config**`,
                    value: `**◎ Success:** Roles successfully set in the assignable role menu!\nYour current menu has been updated.${
                      msg !== '' ? `\n\nThe following roles are **already** in the active rolemenu:\n${msg}` : ''
                    }`
                  });
                  message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
                } catch {
                  const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                    name: `**${this.client.user.username} - Config**`,
                    value: `**◎ Success:** Roles successfully set in the assignable role menu!\n**However** I was unable to update the current rolemenu, you will have to run \`${prefix}rolemenu\` to create a menu again.`
                  });
                  message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
                }
              }
            }

            const updateRoleMenu = db.prepare(`UPDATE rolemenu SET roleList = (@roleList) WHERE guildid=${message.guild.id}`);
            updateRoleMenu.run({
              roleList: JSON.stringify(foundRoleList)
            });
          }
          return;
        }

        if (args[1] === 'remove') {
          if (message.mentions.roles.size <= 0) {
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: '**◎ Error:** You must mention a role to remove from the menu.'
            });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }

          const mentions = message.mentions.roles.map((role) => role.id);

          const foundRoleMenu = db.prepare(`SELECT * FROM rolemenu WHERE guildid = ${message.guild.id}`).get();
          const fetchList = JSON.parse(foundRoleMenu.roleList);

          const roleList = JSON.parse(foundRoleMenu.roleList);

          let msg = '';

          for (const role of mentions) {
            if (roleList.includes(role)) {
              const index = roleList.indexOf(role);
              roleList.splice(index, 1);
              const updateRoleList = db.prepare('UPDATE rolemenu SET roleList = (@roleList) WHERE guildid = (@guildid)');
              updateRoleList.run({
                guildid: `${message.guild.id}`,
                roleList: JSON.stringify(roleList)
              });
            } else {
              msg += `<@&${role}>\n`;
            }
          }

          // eslint-disable-next-line no-inner-declarations
          function haveSameData(obj1, obj2) {
            const obj1Length = Object.keys(obj1).length;
            const obj2Length = Object.keys(obj2).length;

            if (obj1Length === obj2Length) {
              return Object.keys(obj1).every(
                // eslint-disable-next-line no-prototype-builtins
                (key) => obj2.hasOwnProperty(key) && obj2[key] === obj1[key]
              );
            }
            return false;
          }

          if (haveSameData(fetchList, roleList)) {
            if (msg !== '') {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value: `**◎ Error:** The following roles are **not** in the active rolemenu:\n${msg}`
              });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            }
            return;
          }

          if (foundRoleMenu.activeRoleMenuID) {
            const activeMenu = JSON.parse(foundRoleMenu.activeRoleMenuID);

            if (activeMenu) {
              const ch = message.guild.channels.cache.get(activeMenu.channel);

              try {
                ch.messages.fetch({ message: activeMenu.message }).then((ms) => {
                  // Update the message with the new array of roles
                  const row = new ActionRowBuilder();

                  for (const buttonObject of roleList) {
                    const currentRoles = message.guild.roles.cache.get(buttonObject);

                    row.addComponents(
                      new ButtonBuilder().setCustomId(`rm-${currentRoles.id}`).setLabel(`${currentRoles.name}`).setStyle(ButtonStyle.Success)
                    );
                  }

                  setTimeout(() => {
                    // I added this timeout because I couldn’t be bothered fixing, please don’t remove or I cry
                    const roleMenuEmbed = new EmbedBuilder()
                      .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                      .setTitle('Assign a Role')
                      .setDescription('Select the role you wish to assign to yourself.');
                    ms.edit({ embeds: [roleMenuEmbed], components: [row] });
                  });
                }, 1000);

                this.client.utils.messageDelete(message, 10000);

                const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                  name: `**${this.client.user.username} - Config**`,
                  value: `**◎ Success:** Specified roles have successfully been removed from the rolemenu!${
                    msg !== '' ? `\n\nThe following roles are **not** in the active rolemenu:\n${msg}` : ''
                  }`
                });
                message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              } catch {
                this.client.utils.messageDelete(message, 10000);

                const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                  name: `**${this.client.user.username} - Config**`,
                  value: `**◎ Error:** Specified roles have successfully been removed from the rolemene. However, I was unable to update the existing menu, you will have to run \`${prefix}rolemenu\` again to reset the menu.`
                });
                message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              }
            }
          }
          return;
        }

        if (args[1] === 'clear') {
          const foundRoleMenu = db.prepare(`SELECT * FROM rolemenu WHERE guildid=${message.guild.id}`).get();
          if (!foundRoleMenu) {
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: '**◎ Error:** The roles for the menu have not been set yet. Please try again later.'
            });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }

          this.client.utils.messageDelete(message, 10000);

          // delete the rolemenu message if it exists
          if (foundRoleMenu.activeRoleMenuID) {
            const activeMenu = JSON.parse(foundRoleMenu.activeRoleMenuID);

            if (activeMenu) {
              const ch = message.guild.channels.cache.get(activeMenu.channel);

              try {
                ch.messages.fetch({ message: activeMenu.message }).then((ms) => {
                  ms.delete();
                });

                const embed = new EmbedBuilder()
                  .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                  .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Rolemenu has been cleared!' });
                message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              } catch {
                const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                  name: `**${this.client.user.username} - Config**`,
                  value: '**◎ Error:** Rolemenu has been cleared, however I was unable to delete the message.'
                });
                message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              }
            }
          }

          db.prepare(`DELETE FROM rolemenu WHERE guildid=${message.guild.id}`).run();
          const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Success:** All roles have successfully been cleagreen from the rolemenu!'
          });
          message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          return;
        }

        this.client.utils.messageDelete(message, 10000);

        const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
          name: `**${this.client.user.username} - Config**`,
          value: `**◎ Error:** Please use \`${prefix}config\` to see available commands!`
        });
        message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }

      // hastebin
      if (args[0] === 'haste') {
        // preparing count
        this.client.getTable = db.prepare('SELECT * FROM hastebin WHERE guildid = ?');
        let status;
        if (message.guild.id) {
          status = this.client.getTable.get(message.guild.id);

          if (args[1] === 'url') {
            if (args[2] === 'on') {
              // if already on
              if (status) {
                this.client.utils.messageDelete(message, 10000);

                const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                  name: `**${this.client.user.username} - Config**`,
                  value: `**◎ Error:** Hastebin URL blocker is already enabled on this guild! To disable it, please use \`${prefix}config haste url <off>\``
                });
                message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
                return;
              }
              const insert = db.prepare('INSERT INTO hastebin (guildid, status) VALUES (@guildid, @status);');
              insert.run({
                guildid: `${message.guild.id}`,
                status: 'on'
              });

              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Hastebin URL blocker was enabled.' });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));

              // if args = off
            } else if (args[2] === 'off') {
              // if already off
              if (!status) {
                this.client.utils.messageDelete(message, 10000);

                const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                  name: `**${this.client.user.username} - Config**`,
                  value: `**◎ Error:** Hastebin URL blocker is not enabled on this guild! To activate it, please use \`${prefix}config haste url <on>\``
                });
                message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
                return;
              }

              this.client.utils.messageDelete(message, 10000);

              db.prepare('DELETE FROM hastebin WHERE guildid = ?').run(message.guild.id);
              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Hastebin URL blocker was disabled!' });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            } else if (args[2] !== 'off' || args[2] !== 'on') {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value: `**◎ Error:** Correct usage \`${prefix}config haste inv <on/off>\``
              });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }
          }
        }
      }

      // dadbot
      if (args[0] === 'dadbot') {
        // preparing count
        this.client.getTable = db.prepare('SELECT * FROM dadbot WHERE guildid = ?');
        let status;
        if (message.guild.id) {
          status = this.client.getTable.get(message.guild.id);

          if (args[1] === 'on') {
            // if already on
            if (status) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value: `**◎ Error:** Dad bot is already enabled on this guild! To disable it, please use \`${prefix}config dadbot <off>\``
              });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }
            const insert = db.prepare('INSERT INTO dadbot (guildid, status) VALUES (@guildid, @status);');
            insert.run({
              guildid: `${message.guild.id}`,
              status: 'on'
            });

            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Dad bot was enabled' });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));

            // if args = off
          } else if (args[1] === 'off') {
            // if already off
            if (!status) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value: `**◎ Error:** Dad bot is not enabled on this guild! To activate it, please use \`${prefix}config dadbot <on>\``
              });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            this.client.utils.messageDelete(message, 10000);

            db.prepare('DELETE FROM dadbot WHERE guildid = ?').run(message.guild.id);
            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Dad bot was disabled!' });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          } else if (args[1] !== 'off' || args[1] !== 'on') {
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: `**◎ Error:** Correct usage \`${prefix}config dadbot <on/off>\``
            });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }
        }
      }

      // adsprot
      if (args[0] === 'adsprot') {
        // perms checking
        if (!message.member.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
          this.client.utils.messageDelete(message, 10000);

          const npPerms = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Ads Protection**`,
            value: '**◎ Error:** I need to have the `MANAGE_MESSAGES` permission for this function.'
          });
          message.channel.send({ embeds: [npPerms] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          return;
        }

        // preparing count
        this.client.getTable = db.prepare('SELECT * FROM adsprot WHERE guildid = ?');
        let status;
        if (message.guild.id) {
          status = this.client.getTable.get(message.guild.id);

          if (args[1] === 'on') {
            // if already on
            if (status) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value: `**◎ Error:** Advert protection is already enabled on this guild! To disable it, please use \`${prefix}config adsprot <off>\``
              });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            const insert = db.prepare('INSERT INTO adsprot (guildid, status) VALUES (@guildid, @status);');
            insert.run({
              guildid: `${message.guild.id}`,
              status: 'on'
            });
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Advert protection was enabled' });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));

            // if args = off
          } else if (args[1] === 'off') {
            // if already off
            if (!status) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value: `**◎ Error:** Advert protection is not enabled on this guild! To activate it, please use \`${prefix}config adsprot <on>\``
              });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            this.client.utils.messageDelete(message, 10000);

            db.prepare('DELETE FROM adsprot WHERE guildid = ?').run(message.guild.id);
            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Advert protection was disabled' });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          } else if (args[1] !== 'off' || args[1] !== 'on') {
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: `**◎ Error:** Please use \`${prefix}config adsprot <on/off>\``
            });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }
        }
      }

      // autorole
      if (args[0] === 'autorole') {
        this.client.getTable = db.prepare('SELECT * FROM autorole WHERE guildid = ?');
        let role;
        if (message.guild.id) {
          role = this.client.getTable.get(message.guild.id);

          if (!args[1]) {
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: `**◎ Error:** Please use \`${prefix}config autorole <role>\` __the role is case sensitive!__`
            });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }
          if (args[1] === 'off') {
            if (!role) {
              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Autorole is already disabled!' });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            this.client.utils.messageDelete(message, 10000);

            db.prepare('DELETE FROM autorole WHERE guildid = ?').run(message.guild.id);
            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Autorole disabled!' });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }
          if (!message.guild.roles.cache.some((r) => [`${args[1]}`].includes(r.name))) {
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: '**◎ Error:** That role does not exist! Roles are case sensitive. (You do not tag the role, simply write the name of the role)'
            });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }
          if (role) {
            const update = db.prepare('UPDATE autorole SET role = (@role) WHERE guildid = (@guildid);');
            update.run({
              guildid: `${message.guild.id}`,
              role: `${args[1]}`
            });
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Autorole updated to \`${args[1]}\`!` });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }

          const insert = db.prepare('INSERT INTO autorole (guildid, role) VALUES (@guildid, @role);');
          insert.run({
            guildid: `${message.guild.id}`,
            role: `${args[1]}`
          });
          this.client.utils.messageDelete(message, 10000);

          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Autorole set to \`${args[1]}\`!` });
          message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          return;
        }
      }

      // logging
      if (args[0] === 'logging') {
        if (!message.member.guild.members.me.permissions.has(PermissionsBitField.Flags.ViewAuditLog)) {
          this.client.utils.messageDelete(message, 10000);

          const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** I need the permission `Manage Channels` for this command!'
          });
          message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          return;
        }
        this.client.getTable = db.prepare('SELECT * FROM logging WHERE guildid = ?');

        const lchan = message.mentions.channels.first();

        let status;
        if (message.guild.id) {
          status = this.client.getTable.get(message.guild.id);

          if (args[1] === undefined) {
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Please mention a channel!' });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }

          if (args[1] === 'off') {
            // to turn logging off
            if (!status) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Logging is already disabled!' });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Logging disabled!' });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            db.prepare('DELETE FROM logging WHERE guildid = ?').run(message.guild.id);
            return;
          }
          if (!lchan) {
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: '**◎ Error:** Check if the channel\'s name is correct and then type the command again.'
            });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }
          if (lchan.type === ChannelType.GuildVoice || lchan.type === ChannelType.GuildCategory) {
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: '**◎ Error:** Check if the text channel\'s name is correct and then type the command again.'
            });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }
          if (!status) {
            const insert = db.prepare('INSERT INTO logging (guildid, channel) VALUES (@guildid, @channel);');
            insert.run({
              guildid: `${message.guild.id}`,
              channel: `${lchan.id}`
            });
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Logging set to ${lchan}` });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }

          const update = db.prepare('UPDATE logging SET channel = (@channel) WHERE guildid = (@guildid);');
          update.run({
            guildid: `${message.guild.id}`,
            channel: `${lchan.id}`
          });
          this.client.utils.messageDelete(message, 10000);

          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Logging updated to ${lchan}` });
          message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          return;
        }
      }

      // ticket cat and log and role
      if (args[0] === 'ticket') {
        if (args[1] === 'cat') {
          this.client.getTable = db.prepare('SELECT category FROM ticketConfig WHERE guildid = ?');

          const category = message.guild.channels.cache.find((c) => c.name === args.slice(2).join(' ') && c.type === ChannelType.GuildCategory);

          let status;
          if (message.guild.id) {
            status = this.client.getTable.get(message.guild.id);

            if (args[2] === undefined) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Please type the name of the category!' });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            if (args[2] === 'off') {
              // to turn logging off
              if (!status) {
                this.client.utils.messageDelete(message, 10000);

                const embed = new EmbedBuilder()
                  .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                  .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Ticket Category is already disabled!' });
                message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
                return;
              }

              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Ticket Category disabled!' });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              db.prepare('UPDATE ticketConfig SET category = (@cat) WHERE guildid = (@guildid);').run({
                guildid: `${message.guild.id}`,
                cat: null
              });
              return;
            }
            if (!category) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value: '**◎ Error:** Check if the categories name is correct and then type the command again. (The name is case sensitive!'
              });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }
            if (!status) {
              const insert = db.prepare('INSERT INTO ticketConfig (guildid, category) VALUES (@guildid, @category);');
              insert.run({
                guildid: `${message.guild.id}`,
                category: `${category.id}`
              });
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value: `**◎ Success:** Ticket Category set to \`${category.name}\``
              });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            const update = db.prepare('UPDATE ticketConfig SET category = (@category) WHERE guildid = (@guildid);');
            update.run({
              guildid: `${message.guild.id}`,
              category: `${category.id}`
            });
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: `**◎ Success:** Ticket Category updated to \`${category.name}\``
            });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }
        } else if (args[1] === 'log') {
          this.client.getTable = db.prepare('SELECT log FROM ticketConfig WHERE guildid = ?');

          const lchan = message.mentions.channels.first();

          let status;
          if (message.guild.id) {
            status = this.client.getTable.get(message.guild.id);

            if (args[2] === undefined) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Please mention a channel!' });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            if (args[2] === 'off') {
              // to turn logging off
              if (!status) {
                this.client.utils.messageDelete(message, 10000);

                const embed = new EmbedBuilder()
                  .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                  .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Ticket Logging is already disabled!' });
                message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
                return;
              }

              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Ticket Logging disabled!' });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              db.prepare('UPDATE ticketConfig SET log = (@log) WHERE guildid = (@guildid)').run({
                guildid: message.guild.id,
                log: null
              });
              return;
            }
            if (!lchan) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value: '**◎ Error:** Check if the categories name is correct and then type the command again. (The name is case sensitive!'
              });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }
            if (!status) {
              const insert = db.prepare('INSERT INTO ticketConfig (guildid, log) VALUES (@guildid, @channel);');
              insert.run({
                guildid: `${message.guild.id}`,
                channel: `${lchan.id}`
              });
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Ticket Logging set to ${lchan}` });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            const update = db.prepare('UPDATE ticketConfig SET log = (@log) WHERE guildid = (@guildid);');
            update.run({
              guildid: `${message.guild.id}`,
              log: `${lchan.id}`
            });
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Ticket Logging updated to ${lchan}` });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }
        } else if (args[1] === 'role') {
          this.client.getTable = db.prepare('SELECT role FROM ticketConfig WHERE guildid = ?');
          const status = this.client.getTable.get(message.guild.id);

          const suppRole = message.mentions.roles.first();

          if (message.mentions.roles.size <= 0 && args[2] !== 'off') {
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** A role must be mentioned' });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }
          if (args[2] === 'off') {
            const update = db.prepare('UPDATE ticketConfig SET role = (@role) WHERE guildid = (@guildid)');
            update.run({
              guildid: `${message.guild.id}`,
              role: null
            });
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Custom Support Role disabled!' });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }
          if (!status) {
            const update = db.prepare('INSERT INTO ticketConfig (role, guildid) VALUES (@role, @guildid);');
            update.run({
              guildid: `${message.guild.id}`,
              role: `${suppRole.id}`
            });
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Support Role updated to ${suppRole}` });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }

          const update = db.prepare('UPDATE ticketConfig SET role = (@role) WHERE guildid = (@guildid);');
          update.run({
            guildid: `${message.guild.id}`,
            role: `${suppRole.id}`
          });
          this.client.utils.messageDelete(message, 10000);

          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Support Role updated to ${suppRole}` });
          message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          return;
        }
      }

      // setprefix

      if (args[0] === 'prefix') {
        const talkedRecently = new Set();

        if (talkedRecently.has(message.author.id)) {
          this.client.utils.messageDelete(message, 10000);

          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Wait 1 minute before changing the prefix again.' });
          message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        } else {
          talkedRecently.add(message.author.id);
          setTimeout(() => {
            talkedRecently.delete(message.author.id);
          }, 60000);
        }

        this.client.getTable = db.prepare('SELECT * FROM setprefix WHERE guildid = ?');

        if (args[1] === 'off') {
          const off = db.prepare('UPDATE setprefix SET prefix = (\'-\') WHERE guildid = (@guildid);');
          off.run({
            guildid: `${message.guild.id}`
          });
          this.client.utils.messageDelete(message, 10000);

          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Custom prefix disabled!' });
          message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          return;
        }

        if (!args[1]) {
          this.client.utils.messageDelete(message, 10000);

          const tomakataABCSUCC = new EmbedBuilder()
            .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Please input some text.' });
          message.channel.send({ embeds: [tomakataABCSUCC] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          return;
        }

        if (
          args[1].includes('[') ||
          args[1].includes('{') ||
          args[1].includes(']') ||
          args[1].includes('}') ||
          args[1].includes(':') ||
          args[1].includes('|')
        ) {
          this.client.utils.messageDelete(message, 10000);

          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Please choose another prefix.' });
          message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          return;
        }

        if (args[1].length >= 5) {
          this.client.utils.messageDelete(message, 10000);

          const tomakataABCSUCC = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
            name: `**${this.client.user.username} - Config**`,
            value: '**◎ Error:** Please input a prefix no longer than 5 characters.'
          });
          message.channel.send({ embeds: [tomakataABCSUCC] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          return;
        }

        if (!args[1]) {
          this.client.utils.messageDelete(message, 10000);

          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Incorrect usage!' });
          message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          return;
        }

        if (prefix) {
          const update = db.prepare('UPDATE setprefix SET prefix = (@prefix) WHERE guildid = (@guildid);');
          update.run({
            guildid: `${message.guild.id}`,
            prefix: `${args[1]}`
          });
          this.client.utils.messageDelete(message, 10000);

          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Prefix updated!' });
          message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
          return;
        }

        const insert = db.prepare('INSERT INTO setprefix (guildid, prefix) VALUES (@guildid, @prefix);');
        insert.run({
          guildid: `${message.guild.id}`,
          prefix: `${args[1]}`
        });
        this.client.utils.messageDelete(message, 10000);

        const embed = new EmbedBuilder()
          .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
          .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Prefix set!' });
        message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        return;
      }

      // setwelcome

      if (args[0] === 'welcome') {
        if (args[1] === undefined) {
          const embed = new EmbedBuilder()
            .setThumbnail(this.client.user.displayAvatarURL())
            .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
            .addFields({
              name: 'Ragnarok',
              value: `**◎ Set Welcome:** To set the welcome channel, the command is \`${prefix}config welcome channel <#channel>\`\nTo disable the welcome, use \`${prefix}config welcome channel off\``
            })
            .setTimestamp();
          message.channel.send({ embeds: [embed] });
          return;
        }
        if (args[1] === 'image') {
          this.client.getTable = db.prepare('SELECT * FROM setwelcome WHERE guildid = ?');

          let status;
          if (message.guild.id) {
            status = this.client.getTable.get(message.guild.id);

            if (args[2] === 'off') {
              if (!status.image) {
                this.client.utils.messageDelete(message, 10000);

                const embed = new EmbedBuilder()
                  .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                  .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** You have no custom image enabled!' });
                message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
                return;
              }
              const update = db.prepare('UPDATE setwelcome SET image = (@image) WHERE guildid = (@guildid);');
              update.run({
                guildid: `${message.guild.id}`,
                image: null
              });

              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Custom image has been disabled!' });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            if (!args[2]) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value: `**◎ Error:** Incorrect Usage! An example of this command would be: \`${prefix}config welcome image <url-to-image>\` or to disable: \`${prefix}config welcome image off\``
              });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            const urlExtension = args[2].substring(args[2].lastIndexOf('.') + 1);
            const validExtensions = ['jpg', 'jpeg', 'png'];

            if (!validExtensions.includes(urlExtension)) {
              this.client.utils.messageDelete(message, 10000);

              const invalidExt = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value: `**◎ Error:** \`.${urlExtension}\` is not a valid image type!\n\n**Acceptable files:**\n\`${validExtensions.join(', ')}\``
              });
              message.channel.send({ embeds: [invalidExt] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            const urlRegex = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;

            if (!urlRegex.test(args[2])) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value:
                  '**◎ Error:** Please enter a valid URL, the URL must be absolute! An example of an absolute URL would be: https://www.google.com'
              });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            await fetch(args[2]).then(async (res) => {
              if (res.ok) {
                if (!status) {
                  this.client.utils.messageDelete(message, 10000);

                  const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                    name: `**${this.client.user.username} - Config**`,
                    value: `**◎ Error:** You must enable the welcome module first! You can do this by running the following command. \`${prefix}config welcome channel <#channel>\``
                  });
                  message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
                } else {
                  try {
                    await Canvas.loadImage(args[2]);
                  } catch {
                    this.client.utils.messageDelete(message, 10000);

                    const invalidExt = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                      name: `**${this.client.user.username} - Config**`,
                      value: `**◎ Error:** I was unable to process \`${args[2]}\`\nIs it a valid image?`
                    });
                    message.channel.send({ embeds: [invalidExt] }).then((m) => this.client.utils.deletableCheck(m, 10000));
                    return;
                  }

                  const update = db.prepare('UPDATE setwelcome SET image = (@image) WHERE guildid = (@guildid);');
                  update.run({
                    guildid: `${message.guild.id}`,
                    image: args[2]
                  });
                  this.client.utils.messageDelete(message, 0);

                  const embed = new EmbedBuilder()
                    .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                    .setImage(args[2])
                    .addFields({
                      name: `**${this.client.user.username} - Config**`,
                      value: '**◎ Success:** Image has been updated to the following.'
                    });
                  message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
                }
              } else {
                this.client.utils.messageDelete(message, 10000);

                const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                  name: `**${this.client.user.username} - Config**`,
                  value:
                    '**◎ Error:** Please enter a valid image URL! The end of the URL must end with one of the supported extensions. (`.jpg, .jpeg, .png`)'
                });
                message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              }
            });

            return;
          }
        }

        if (args[1] === 'channel') {
          this.client.getTable = db.prepare('SELECT * FROM setwelcome WHERE guildid = ?');

          const lchan = message.mentions.channels.first();

          let status;
          if (message.guild.id) {
            status = this.client.getTable.get(message.guild.id);

            if (args[2] === undefined) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Please mention a channel!' });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            if (args[2] === 'off') {
              // to turn logging off
              if (!status) {
                this.client.utils.messageDelete(message, 10000);

                const embed = new EmbedBuilder()
                  .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                  .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Welcome channel is already disabled!' });
                message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              } else {
                this.client.utils.messageDelete(message, 10000);

                const embed = new EmbedBuilder()
                  .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                  .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Welcome channel disabled!' });
                message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
                db.prepare('DELETE FROM setwelcome WHERE guildid = (@guildid)').run({
                  guildid: message.guild.id
                });
              }
            } else if (!lchan) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
                name: `**${this.client.user.username} - Config**`,
                value: '**◎ Error:** Check if the categories name is correct and then type the command again. (The name is case sensitive!'
              });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            } else if (!status) {
              const insert = db.prepare('INSERT INTO setwelcome (guildid, channel) VALUES (@guildid, @channel);');
              insert.run({
                guildid: `${message.guild.id}`,
                channel: `${lchan.id}`
              });
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Welcome channel is now set to ${lchan}` });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            } else {
              const update = db.prepare('UPDATE setwelcome SET channel = (@channel) WHERE guildid = (@guildid);');
              update.run({
                guildid: `${message.guild.id}`,
                channel: `${lchan.id}`
              });
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Welcome channel updated to ${lchan}` });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            }
          }
        }
      }

      // starboard
      if (args[0] === 'starboard') {
        this.client.getTable = db.prepare('SELECT * FROM starboard WHERE guildid = ?');

        const lchan = message.mentions.channels.first();

        let status;
        if (message.guild.id) {
          status = this.client.getTable.get(message.guild.id);

          if (args[1] === undefined) {
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Please mention a channel!' });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }

          if (args[1] === 'off') {
            // to turn logging off
            if (!status) {
              this.client.utils.messageDelete(message, 10000);

              const embed = new EmbedBuilder()
                .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
                .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Error:** Starboard is already disabled!' });
              message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
              return;
            }

            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: '**◎ Success:** Starboard disabled!' });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            db.prepare('DELETE FROM starboard WHERE guildid = ?').run(message.guild.id);
            return;
          }
          if (!lchan) {
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: '**◎ Error:** Check if the channel\'s name is correct and then type the command again.'
            });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }
          if (lchan.type === ChannelType.GuildVoice || lchan.type === ChannelType.GuildCategory) {
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
              name: `**${this.client.user.username} - Config**`,
              value: '**◎ Error:** Check if the text channel\'s name is correct and then type the command again.'
            });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }
          if (!status) {
            const insert = db.prepare('INSERT INTO starboard (guildid, channel) VALUES (@guildid, @channel);');
            insert.run({
              guildid: `${message.guild.id}`,
              channel: `${lchan.id}`
            });
            this.client.utils.messageDelete(message, 10000);

            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
              .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Starboard set to ${lchan}` });
            message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
            return;
          }

          const update = db.prepare('UPDATE starboard SET channel = (@channel) WHERE guildid = (@guildid);');
          update.run({
            guildid: `${message.guild.id}`,
            channel: `${lchan.id}`
          });
          this.client.utils.messageDelete(message, 10000);

          const embed = new EmbedBuilder()
            .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
            .addFields({ name: `**${this.client.user.username} - Config**`, value: `**◎ Success:** Starboard updated to ${lchan}` });
          message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
        }
      }
    }
  }
};

export default CommandF;
