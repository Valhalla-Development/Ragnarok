const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, channel, color) => {
  const id = db
    .prepare(`SELECT channel FROM logging WHERE guildid = ${channel.guild.id};`)
    .get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;

  const logembed = new MessageEmbed()
    .setAuthor(channel.guild, channel.guild.iconURL())
    .setColor(color)
    .setFooter(`ID: ${channel.id}`)
    .setTimestamp();

  let updateM;

  if (channel.type === 'text') {
    updateM = `**Text Channel Deleted:**\n\`#${channel.name}\``;
    logembed
      .setDescription(updateM);
    bot.channels.cache.get(logs).send(logembed);
  }

  if (channel.type === 'voice') {
    updateM = `**Voice Channel Deleted:**\n\`${channel.name}\``;
    logembed
      .setDescription(updateM);
    bot.channels.cache.get(logs).send(logembed);
  }

  if (channel.type === 'category') {
    updateM = `**Category Deleted:**\n\`${channel.name}\``;
    logembed
      .setDescription(updateM);
    bot.channels.cache.get(logs).send(logembed);
  }
};
