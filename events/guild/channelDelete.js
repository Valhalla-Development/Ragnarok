const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const { color } = require('../../storage/config.json');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, channel) => {
  if (bot.guilds.cache.get('343572980351107077')) return; // REMOVE, this is for bug testing

  const id = db
    .prepare(`SELECT channel FROM logging WHERE guildid = ${channel.guild.id};`)
    .get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  if (channel.type === 'voice' || channel.type === 'category') return;
  const logembed = new MessageEmbed()
    .setAuthor(channel.guild, channel.guild.iconURL())
    .setDescription(`**Channel Deleted:** #${channel.name}`)
    .setColor(color)
    .setFooter(`ID: ${channel.id}`)
    .setTimestamp();
  bot.channels.cache.get(logs).send(logembed);
};
