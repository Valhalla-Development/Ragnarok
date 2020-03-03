module.exports = {
  config: {
    name: 'resumes',
    usage: '${prefix}resume',
    category: 'music',
    description: 'Resume the bot playback.',
    accessableby: 'Everyone',
  },
  run: (bot, message) => {
    const player = bot.music.players.get(message.guild.id);
    if (!player) return message.channel.send('No song/s currently playing in this guild.');

    const { channel } = message.member.voice;
    if (!channel || channel.id !== player.voiceChannel.id) return message.channel.send('You need to be in a voice channel to pause music.');


    player.pause(player.playing);
    return message.channel.send('Resuming playback.');
  },
};
