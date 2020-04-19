const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'skip',
    usage: '${prefix}skip',
    category: 'music',
    description: 'Skips the song currently playing.',
    accessableby: 'Everyone',
    aliases: ['next'],
  },
  run: (bot, message, color) => {
    if (!message.member.guild.me.hasPermission('EMBED_LINKS')) {
      message.channel.send('I need the permission `Embed Links` for this command!');
      return;
    }

    const prefixgrab = db
      .prepare('SELECT prefix FROM setprefix WHERE guildid = ?')
      .get(message.guild.id);
    const { prefix } = prefixgrab;

    const dlRoleGrab = db
      .prepare(
        `SELECT role FROM music WHERE guildid = ${message.guild.id}`,
      )
      .get();

    let role;
    if (dlRoleGrab) {
      role = message.guild.roles.cache.find((r) => r.id === dlRoleGrab.role);
    } else {
      role = message.guild.roles.cache.find((x) => x.name === 'DJ');
    }

    if (!role) {
      const noRoleMessage = language.music.noRole;
      const noRolePrefix = noRoleMessage.replace('${prefix}', prefix);
      const noRoleF = new MessageEmbed()
        .setColor(color)
        .setDescription(`${noRolePrefix}`);
      message.channel.send(noRoleF).then((msg) => msg.delete({
        timeout: 15000,
      }));
      return;
    }

    if (
      !message.member.roles.cache.has(role.id) && message.author.id !== message.guild.ownerID) {
      const donthaveroleMessage = language.music.donthaveRole;
      const donthaverolerole = donthaveroleMessage.replace('${role}', role);
      const donthaveRole = new MessageEmbed()
        .setColor(color)
        .setDescription(`${donthaverolerole}`);
      message.channel.send(donthaveRole);
      return;
    }

    const player = bot.music.players.get(message.guild.id);
    const { channel } = message.member.voice;

    if (!player) {
      const notplaying = new MessageEmbed()
        .setColor(color)
        .setDescription(`${language.music.noPlaying}`);
      message.channel.send(notplaying).then((msg) => msg.delete({
        timeout: 15000,
      }));
      return;
    }

    if (!channel || channel.id !== player.voiceChannel.id) {
      const novoice = new MessageEmbed()
        .setColor(color)
        .setDescription(`${language.music.notinVoice}`);
      message.channel.send(novoice).then((msg) => msg.delete({
        timeout: 15000,
      }));
      return;
    }

    player.stop();
    if (player.queue.length < 1) return bot.music.players.destroy(message.guild.id);
    const stop = new MessageEmbed()
      .setColor(color)
      .setDescription(`${language.music.skip}`);
    message.channel.send(stop).then((msg) => msg.delete({
      timeout: 15000,
    }));
    return;
  },
};
