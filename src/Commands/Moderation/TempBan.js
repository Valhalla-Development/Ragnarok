import { EmbedBuilder, PermissionsBitField } from 'discord.js';
import SQLite from 'better-sqlite3';
import ms from 'ms';
import Command from '../../Structures/Command.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const CommandF = class extends Command {
  constructor(...args) {
    super(...args, {
      description: 'Temp-Bans tagged user from the guild.',
      category: 'Moderation',
      usage: '<@user> <time> [reason]',
      userPerms: ['BanMembers'],
      botPerms: ['BanMembers']
    });
  }

  async run(message, args) {
    const prefixgrab = db.prepare('SELECT prefix FROM setprefix WHERE guildid = ?').get(message.guild.id);
    const { prefix } = prefixgrab;

    const user = message.mentions.users.size
      ? message.guild.members.cache.get(message.mentions.users.first().id)
      : message.guild.members.cache.get(args[0]);

    // No user
    if (!user) {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Temp-Ban**`, value: `**◎ Error:** Run \`${prefix}help tempban\` If you are unsure.` });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    // If user id = message id
    if (user.user.id === message.author.id) {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Temp-Ban**`, value: '**◎ Error:** You cannot Ban yourself!' });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    // Check if user has a role that is higher than the message author
    if (user.roles.highest.position >= message.member.roles.highest.position) {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Temp-Ban**`,
        value: '**◎ Error:** You cannot ban someone with a higher role than yourself!'
      });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    // Check if user is bannable
    if (
      user.permissions.has(PermissionsBitField.Flags.ManageGuild) ||
      user.permissions.has(PermissionsBitField.Flags.Administrator) ||
      !user.bannable
    ) {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Temp-Ban**`, value: `**◎ Error:** You cannot ban <@${user.id}>` });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    // Check if user is the bot
    if (user.user.id === this.client.user.id) {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Kick**`, value: '**◎ Error:** You cannot ban me. :slight_frown:' });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    // Define bantime
    const bantime = args[1];
    if (!bantime) {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Temp-Ban**`, value: '**◎ Error:** You must specify a ban time!' });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    // Ensure bantime is a valid option
    if (!args[1].match('[dhms]')) {
      this.client.utils.messageDelete(message, 10000);

      const incorrectFormat = new EmbedBuilder().setColor(this.client.utils.color(message.guild.members.me.displayHexColor)).addFields({
        name: `**${this.client.user.username} - Temp-Ban**`,
        value: '**◎ Error:** You did not use the correct formatting for the time! The valid options are `d`, `h`, `m` or `s`'
      });
      message.channel.send({ embeds: [incorrectFormat] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    // Checks if bantime is a number
    if (Number.isNaN(ms(args[1]))) {
      this.client.utils.messageDelete(message, 10000);

      const invalidDur = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Temp-Ban**`, value: '**◎ Error:** Please input a valid duration!' });
      message.channel.send({ embeds: [invalidDur] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    // Check if bantime is higher than 30 seconds
    if (ms(args[1]) < '30000') {
      this.client.utils.messageDelete(message, 10000);

      const valueLow = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Temp-Ban**`, value: '**◎ Error:** Please input a value higher than 30 seconds!' });
      message.channel.send({ embeds: [valueLow] }).then((m) => this.client.utils.deletableCheck(m, 10000));
      return;
    }

    let reason = args.slice(2).join(' ');
    if (!reason) reason = 'No reason given.';

    const authoMes = new EmbedBuilder()
      .setThumbnail(this.client.user.displayAvatarURL())
      .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
      .addFields({
        name: `You have been temporarily banned from: \`${message.guild.name}\``,
        value: `**◎ Reason:** ${reason}
				**◎ Time:** \`${ms(ms(bantime), { long: true })}\`
				**◎ Moderator:** ${message.author.tag}`
      })
      .setFooter({ text: 'You have been temporarily banned' })
      .setTimestamp();
    try {
      user.send({ embeds: [authoMes] });
    } catch {
      // Do nothing
    }

    // Kick the user and send the embed
    await message.guild.members.ban(user, { deleteMessageDays: 1, reason: `${reason}-tempban` }).catch(() => {
      this.client.utils.messageDelete(message, 10000);

      const embed = new EmbedBuilder()
        .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
        .addFields({ name: `**${this.client.user.username} - Temp-Ban**`, value: '**◎ Error:** An error occured!' });
      message.channel.send({ embeds: [embed] }).then((m) => this.client.utils.deletableCheck(m, 10000));
    });

    const endTime = new Date().getTime() + ms(args[1]);

    const insert = db.prepare(
      'INSERT INTO ban (id, guildid, userid, endtime, channel, username) VALUES (@id, @guildid, @userid, @endtime, @channel, @username);'
    );
    insert.run({
      id: `${message.guild.id}-${user.user.id}`,
      guildid: message.guild.id,
      userid: user.user.id,
      endtime: endTime,
      channel: message.channel.id,
      username: user.user.tag
    });

    const embed = new EmbedBuilder()
      .setThumbnail(this.client.user.displayAvatarURL())
      .setColor(this.client.utils.color(message.guild.members.me.displayHexColor))
      .addFields({
        name: 'Action | Temp-Banned',
        value: `**◎ User:** ${user.user.tag}
				**◎ Reason:** ${reason}
				**◎ Time:** \`${ms(ms(bantime), { long: true })}\`
				**◎ Moderator:** ${message.author.tag}`
      })
      .setFooter({ text: 'User Ban Logs' })
      .setTimestamp();

    const dbid = db.prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`).get();
    if (dbid && dbid.channel && dbid.channel === message.channel.id) return;

    message.channel.send({ embeds: [embed] });

    if (!dbid) return;
    const dblogs = dbid.channel;
    const chnCheck = this.client.channels.cache.get(dblogs);
    if (!chnCheck) {
      db.prepare('DELETE FROM logging WHERE guildid = ?').run(message.guild.id);
    }

    if (dbid) {
      this.client.channels.cache.get(dblogs).send({ embeds: [embed] });
    }
  }
};

export default CommandF;
