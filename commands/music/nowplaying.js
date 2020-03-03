const { Utils } = require('erela.js');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');

module.exports = {
  config: {
    name: 'nowplaying',
    usage: '${prefix}nowplaying',
    category: 'music',
    description: 'Displays what song the bot is currently playing.',
    accessableby: 'Everyone',
    aliases: ['music'],
  },
  run: async (bot, message) => {
    const player = bot.music.players.get(message.guild.id);
    if (!player || !player.queue[0]) return message.channel.send('No songs currently playing within this guild.');
    const {
      title, author, duration, thumbnail,
    } = player.queue[0];

    const embed = new MessageEmbed()
      .setAuthor('Current Song Playing.', message.author.displayAvatarURL)
      .setThumbnail(thumbnail)
      .setDescription(stripIndents`
            ${player.playing ? '▶️' : '⏸️'} **${title}** \`${Utils.formatTime(duration, true)}\` by ${author}
            `);

    return message.channel.send(embed);
  },
};
