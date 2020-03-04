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

  run: async (client, message, args) => {
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
      const player = client.music.players.get(message.guild.id);
      const { channel } = message.member.voice;
      if (!channel) return message.channel.send('Please join a voice channel');
      if (channel.id !== player.voiceChannel.id) return message.channel.send('You need to be in a voice channel to use the queuerepeat command.');
      if (!player) return message.channel.send('No songs currently playing');
      const previousState = player.trackRepeat;

      player.setTrackRepeat(!previousState);
      if (!previousState) {
        message.channel.send('Repeat Mode ON!');
      } else {
        message.channel.send('Repeat Mode OFF!');
      }
    } else if (args[0] === 'queue') {
      const player = client.music.players.get(message.guild.id);
      const { channel } = message.member.voice;
      if (!channel) return message.channel.send('Please join a voice channel');
      if (channel.id !== player.voiceChannel.id) return message.channel.send('You need to be in a voice channel to use the queuerepeat command.');
      if (!player || !player.queue[0]) return message.channel.send('There is no song playing.');

      if (player.queueRepeat === false) {
        player.setQueueRepeat(true);
        const embed = new MessageEmbed()
          .setAuthor('Repeating The Queue');
        return message.channel.send(embed);
      }
      player.setQueueRepeat(false);
      const embed = new MessageEmbed()
        .setAuthor('Stopped Repeating The Queue');
      return message.channel.send(embed);
    }
  },
};
