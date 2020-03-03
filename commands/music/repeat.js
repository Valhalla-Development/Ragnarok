const { MessageEmbed } = require('discord.js');
module.exports = {
  config: {
    name: 'repeat',
    usage: '${prefix}repeat',
    category: 'music',
    description: 'Repeates the current track indefiently.',
    accessableby: 'Everyone',
  },

  run: async (client, message, args) => {
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
