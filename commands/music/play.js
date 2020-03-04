const { Utils } = require('erela.js');
const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const language = require('../../storage/messages.json');
const talkedRecently = new Set();

module.exports = {
  config: {
    name: 'play',
    description: 'Play a song/playlist or search for a song from youtube',
    usage: '<input>',
    category: 'music',
    accessableby: 'Everyone',
    aliases: ['p', 'pplay'],
  },
  run: async (bot, message, args) => {
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
        .setColor('36393F')
        .setDescription(`${noRolePrefix}`);
      message.channel.send(noRoleF).then((msg) => msg.delete({
        timeout: 15000,
      }));
      message.delete({
        timeout: 15000,
      });
      return;
    }

    const { channel } = message.member.voice;
    if (!channel) {
      const novoice = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`${language.music.notinVoice}`);
      message.channel.send(novoice).then((msg) => msg.delete({
        timeout: 15000,
      }));
      message.delete({
        timeout: 15000,
      });
      return;
    }


    const permissions = channel.permissionsFor(bot.user);
    if (!permissions.has('CONNECT')) {
      const noperms1 = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`${language.music.nobotPerms}`);
      message.channel.send(noperms1).then((msg) => msg.delete({
        timeout: 15000,
      }));
      message.delete({
        timeout: 15000,
      });
      return;
    }

    if (!permissions.has('SPEAK')) {
      const noperms2 = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`${language.music.nobotPerms}`);
      message.channel.send(noperms2).then((msg) => msg.delete({
        timeout: 15000,
      }));
      message.delete({
        timeout: 15000,
      });
      return;
    }

    if (talkedRecently.has(message.author.id)) {
      const talkedRec = new MessageEmbed()
        .setDescription(`${language.music.talkedRecently}`);
      message.channel.send(talkedRec);
    } else {
      if (!args[0]) {
        const noargs = new MessageEmbed()
          .setColor('36393F')
          .setDescription(`${language.music.noArgs}`);
        message.channel.send(noargs).then((msg) => msg.delete({
          timeout: 15000,
        }));
        message.delete({
          timeout: 15000,
        });
        return;
      }

      const player = bot.music.players.spawn({
        guild: message.guild,
        textChannel: message.channel,
        voiceChannel: channel,
      });

      bot.music.search(args.join(' '), message.author).then(async (res) => {
        switch (res.loadType) {
          case 'TRACK_LOADED': {
            player.queue.add(res.tracks[0]);
            const trackloade = new MessageEmbed()
              .setAuthor('Enqueueing.', 'https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
              .setColor('36393F')
              .setDescription(`\`${res.tracks[0].title}\`\nDuration: \`${Utils.formatTime(res.tracks[0].duration, true)}\`\nRequested by: ${message.author}`);
            message.channel.send(trackloade);
            if (!player.playing) player.play();
            break;
          }

          case 'SEARCH_RESULT': {
            let index = 1;
            const tracks = res.tracks.slice(0, 10);
            const embed = new MessageEmbed()
              .setAuthor('Search Results.')
              .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
              .setDescription(tracks.map((video) => `**${index++} -** ${video.title} - \`${Utils.formatTime(video.duration, true)}\``))
              .setFooter("Type the track number you wish to play. You have 30 seconds to respond.\nType 'cancel' to cancel the selection");

            await message.channel.send(embed);

            const collector = message.channel.createMessageCollector((m) => m.author.id === message.author.id && new RegExp('^([1-9]|10|cancel)$', 'i').test(m.content), {
              time: 30000,
              max: 1,
            });

            collector.on('collect', (m) => {
              if (/cancel/i.test(m.content)) return collector.stop('cancelled');
              if (m.content.includes(RegExp)) return collector.stop('cancelled');

              const track = tracks[Number(m.content) - 1];
              player.queue.add(track);
              if (!player.playing) player.play();
              if (player.playing) return;
              const trackloade = new MessageEmbed()
                .setAuthor('Enqueuing Track.', 'https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
                .setColor('36393F')
                .setDescription(`\`${track.title}\`\nDuration: \`${Utils.formatTime(track.duration, true)}\`\nRequested by: ${message.author}`);
              message.channel.send(trackloade);
            });

            collector.on('end', (_, reason) => {
              if (['time', 'cancelled'].includes(reason)) {
                const upperReason = reason.charAt(0).toUpperCase() + reason.substring(1);
                const cancelE = new MessageEmbed()
                  .setAuthor(' Cancelled', 'https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
                  .setColor('36393F')
                  .setDescription(`Search results cancelled.\nReason: \`${upperReason}\``);
                message.channel.send(cancelE).then((msg) => msg.delete({
                  timeout: 15000,
                }));
                return;
              }
            });
            break;
          }

          case 'PLAYLIST_LOADED': {
            res.playlist.tracks.forEach((track) => player.queue.add(track));
            const duration = Utils.formatTime(res.playlist.tracks.reduce((acc, cur) => ({
              duration: acc.duration + cur.duration,
            })).duration, true);
            if (player.queue.length < 1) return;
            if (!player.playing) player.play();
            const playlistload = new MessageEmbed()
              .setAuthor('Enqueuing Playlist.', 'https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
              .setColor('36393F')
              .setDescription(`Enqueuing \`${res.playlist.tracks.length}\` \`${duration}\` tracks in playlist \`${res.playlist.info.name}\``);
            message.channel.send(playlistload);
            break;
          }
        }
      }).catch((err) => message.channel.send(`\`${err.message}\``));
      if (message.member.roles.cache.has(role.id) && message.author.id !== message.guild.ownerID) {
        return;
      }
      talkedRecently.add(message.author.id);
      setTimeout(() => {
        const talkedRecRemove = new MessageEmbed()
          .setDescription(`${language.music.talkedRecentlyRemove}`);
        message.channel.send(message.author, talkedRecRemove);
        talkedRecently.delete(message.author.id);
      }, 30000);
    }
  },
};
