module.exports = {
  config: {
    name: 'skip',
    usage: '${prefix}skip',
    category: 'music',
    description: 'Skips the song currently playing.',
    accessableby: 'Everyone',
    aliases: ['next'],
  },
  run: (bot, message) => {
    const player = bot.music.players.get(message.guild.id);
    if (!player) return message.channel.send('No song/s currently playing in this guild.');

    const { channel } = message.member.voice;
    if (!channel || channel.id !== player.voiceChannel.id) return message.channel.send('You need to be in a voice channel to use the skip command.');

    player.stop();
    return message.channel.send('Skipped the current song!');
  },
};
