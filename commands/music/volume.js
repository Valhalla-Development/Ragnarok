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
  run: async (bot, message, args, color) => {
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
      message.channel.send(noRoleF);
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

    if (!args[0]) {
      const volume = new MessageEmbed()
        .setColor(color)
        .setDescription(`${language.music.currentVol} \`${player.volume}\``);
      message.channel.send(volume);
      return;
    }
    if (Number(args[0]) <= 0 || Number(args[0]) > 100) {
      const badVol = new MessageEmbed()
        .setColor(color)
        .setDescription(`${language.music.volLim}`);
      message.channel.send(badVol);
      return;
    }

    player.setVolume(Number(args[0]));
    const newVol = new MessageEmbed()
      .setColor(color)
      .setDescription(`${language.music.newVol} \`${args[0]}\``);
    message.channel.send(newVol);
    return;
  },
};
