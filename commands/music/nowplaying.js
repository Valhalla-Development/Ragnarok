const { Utils } = require('erela.js');
const { MessageEmbed } = require('discord.js');
const { stripIndents } = require('common-tags');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const language = require('../../storage/messages.json');

module.exports = {
  config: {
    name: 'nowplaying',
    usage: '${prefix}nowplaying',
    category: 'music',
    description: 'Displays what song the bot is currently playing.',
    accessableby: 'Everyone',
    aliases: ['np'],
  },
  run: async (bot, message) => {
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
      return;
    }

    const player = bot.music.players.get(message.guild.id);
    if (!player || !player.queue[0]) {
      const notplaying = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`${language.music.noPlaying}`);
      message.channel.send(notplaying).then((msg) => msg.delete({
        timeout: 15000,
      }));
      return;
    }

    const {
      title, duration, requester,
    } = player.queue[0];

    const embed = new MessageEmbed()
      .setAuthor('Current Song Playing', 'https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
      .setColor('36393F')
      .setThumbnail('https://upload.wikimedia.org/wikipedia/commons/7/73/YouTube_Music.png')
      .setDescription(stripIndents`
            ${player.playing ? '▶️' : '⏸️'} **${title}** \`${Utils.formatTime(duration, true)}\` Requested by: [<@${requester.id}>]`);

    return message.channel.send(embed);
  },
};
