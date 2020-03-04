const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');
const language = require('../../storage/messages.json');

module.exports = {

  config: {
    name: 'volume',
    usage: '${prefix}volume <0-100>',
    category: 'music',
    description: 'Adjusts the volume of the bot.',
    accessableby: 'Everyone',
    aliases: ['vol'],
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
      message.channel.send(noRoleF);
      return;
    }

    if (
      !message.member.roles.cache.has(role.id) && message.author.id !== message.guild.ownerID) {
      const donthaveroleMessage = language.music.donthaveRole;
      const donthaverolerole = donthaveroleMessage.replace('${role}', role);
      const donthaveRole = new MessageEmbed()
        .setColor('36393F')
        .setDescription(`${donthaverolerole}`);
      message.channel.send(donthaveRole);
      return;
    }

    const player = bot.music.players.get(message.guild.id);
    if (!player) return message.channel.send('No song/s currently playing within this guild.');

    const { channel } = message.member.voice;
    if (!channel || channel.id !== player.voiceChannel.id) return message.channel.send('You need to be in a voice channel to adjust the volume.');

    if (!args[0]) return message.channel.send(`Current Volume: ${player.volume}`);
    if (Number(args[0]) <= 0 || Number(args[0]) > 100) return message.channel.send('You may only set the volume to 1-100');

    player.setVolume(Number(args[0]));
    return message.channel.send(`Successfully set the volume to: ${args[0]}`);
  },
};
