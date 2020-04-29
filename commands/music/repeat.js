const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'repeat',
    usage: '${prefix}repeat',
    category: 'music',
    description: 'Repeates the current track indefiently.',
    accessableby: 'Everyone',
  },

  run: async (bot, message, args) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    const dlRoleGrab = db
      .prepare(
        `SELECT role FROM music WHERE guildid = ${message.guild.id}`,
      )
      .get();

    const dlRole = message.guild.roles.cache.find((x) => x.name === 'DJ') || message.guild.roles.cache.find((r) => r.id === dlRoleGrab.role);
    if (!dlRole) {
      const noRoleF = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`${language.music.nodjRole}`);
      message.channel.send(noRoleF);
      return;
    }

    if (
      !message.member.roles.cache.has(dlRole.id) && message.author.id !== message.guild.ownerID) {
      const donthaveroleMessage = language.music.donthaveRole;
      const role = donthaveroleMessage.replace('${role}', dlRole);
      const donthaveRole = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`${role}`);
      message.channel.send(donthaveRole);
      return;
    }

    if (!args[0]) {
      const player = bot.music.players.get(message.guild.id);
      const { channel } = message.member.voice;
      if (!player) {
        const notplaying = new MessageEmbed()
          .setColor('36393F')
          .setDescription(`${language.music.noPlaying}`);
        message.channel.send(notplaying).then((msg) => msg.delete({
          timeout: 15000,
        }));
        return;
      }

      if (!channel || channel.id !== player.voiceChannel.id) {
        const novoice = new MessageEmbed()
          .setColor('36393F')
          .setDescription(`${language.music.notinVoice}`);
        message.channel.send(novoice).then((msg) => msg.delete({
          timeout: 15000,
        }));
        return;
      }

      if (!player) {
        const notplaying = new MessageEmbed()
          .setColor('36393F')
          .setDescription(`${language.music.noPlaying}`);
        message.channel.send(notplaying).then((msg) => msg.delete({
          timeout: 15000,
        }));
        return;
      }

      const previousState = player.trackRepeat;

      player.setTrackRepeat(!previousState);
      if (!previousState) {
        player.setTrackRepeat(true);
        const on = new MessageEmbed()
          .setDescription(`${language.music.enabled}`)
          .setColor('36393F');
        message.channel.send(on);
      } else {
        player.setQueueRepeat(false);
        const off = new MessageEmbed()
          .setDescription(`${language.music.disabled}`)
          .setColor('36393F');
        message.channel.send(off);
      }
    } else if (args[0] === 'queue') {
      const player = bot.music.players.get(message.guild.id);
      const { channel } = message.member.voice;
      if (!channel || channel.id !== player.voiceChannel.id) {
        const novoice = new MessageEmbed()
          .setColor('36393F')
          .setDescription(`${language.music.notinVoice}`);
        message.channel.send(novoice).then((msg) => msg.delete({
          timeout: 15000,
        }));
        return;
      }

      if (!player || !player.queue[0]) {
        const notplaying = new MessageEmbed()
          .setColor('36393F')
          .setDescription(`${language.music.noPlaying}`);
        message.channel.send(notplaying).then((msg) => msg.delete({
          timeout: 15000,
        }));
        return;
      }

      if (player.queueRepeat === false) {
        player.setQueueRepeat(true);
        const on = new MessageEmbed()
          .setDescription(`${language.music.enabled}`)
          .setColor('36393F');
        message.channel.send(on);
        return;
      }
      player.setQueueRepeat(false);
      const off = new MessageEmbed()
        .setDescription(`${language.music.disabled}`)
        .setColor('36393F');
      message.channel.send(off);
      return;
    }
  },
};
