module.exports = {
  config: {
    name: 'leave',
    usage: '${prefix}leave',
    category: 'music',
    description: 'Makes the bot leave the voice channel.',
    accessableby: 'Everyone',
    aliases: ['stop'],
  },
  run: async (bot, message) => {
    const { channel } = message.member.voice;
    const player = bot.music.players.get(message.guild.id);

    if (!player) return message.channel.send('No song/s currently playing in this guild.');
    if (!channel || channel.id !== player.voiceChannel.id) return message.channel.send('You need to be in a voice channel to use the leave command.');

    bot.music.players.destroy(message.guild.id);
    return message.channel.send('Successfully stopped the music.');
  },
};
