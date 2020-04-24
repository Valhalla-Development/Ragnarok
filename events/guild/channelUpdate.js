const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, oldChannel, newChannel, color) => {
  const id = db
    .prepare(`SELECT channel FROM logging WHERE guildid = ${oldChannel.guild.id};`)
    .get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  let updateM;
  let oldTopic;
  let newTopic;

  // Check if member count is on, if it is, grab the id of said channels and return if it matches

  // Member Count
  const memStat = db.prepare(`SELECT * FROM membercount WHERE guildid = ${oldChannel.guild.id};`).get();
  if (memStat) {
    const channelA = bot.channels.cache.find((a) => a.id === memStat.channela);
    const channelB = bot.channels.cache.find((b) => b.id === memStat.channelb);
    const channelC = bot.channels.cache.find((c) => c.id === memStat.channelc);

    if (oldChannel.id === channelA.id) {
      return;
    }
    if (oldChannel.id === channelB.id) {
      return;
    }
    if (oldChannel.id === channelC.id) {
      return;
    }
  }

  const logembed = new MessageEmbed()
    .setAuthor(oldChannel.guild, oldChannel.guild.iconURL())
    .setColor(color)
    .setFooter(`Channel ID: ${newChannel.id}`)
    .setTimestamp();

  if (oldChannel.type === 'category') {
    if (oldChannel.name !== newChannel.name) {
      updateM = `**Category Name Updated:**\n\nOld:\n\`${oldChannel.name}\`\nNew:\n\`${newChannel.name}\``;
      logembed
        .setDescription(updateM);
      bot.channels.cache.get(logs).send(logembed);
    }
  }

  if (oldChannel.type === 'voice') {
    if (oldChannel.name !== newChannel.name) {
      updateM = `**Voice Channel Name Updated:**\n\nOld:\n\`${oldChannel.name}\`\nNew:\n\`${newChannel.name}\``;
      logembed
        .setDescription(updateM);
      bot.channels.cache.get(logs).send(logembed);
    }
  }

  if (oldChannel.type === 'text') {
    if (oldChannel.name !== newChannel.name) {
      updateM = `**Channel Name Updated:**\n\nOld:\n\`#${oldChannel.name}\`\nNew:\n<#${newChannel.id}>`;
      logembed
        .setDescription(updateM);
      bot.channels.cache.get(logs).send(logembed);
    }
  }

  if (oldChannel.topic !== newChannel.topic) {
    if (oldChannel.topic === '') {
      oldTopic = '';
    } else {
      oldTopic = `${oldChannel.topic}`;
    }
    if (newChannel.topic === '') {
      newTopic = '';
    } else {
      newTopic = `${newChannel.topic}`;
    }
    updateM = `**Channel Topic Updated:**\n\nOld:\n\`${oldTopic}\`\nNew:\n\`${newTopic}\``;
    logembed
      .setDescription(updateM);
    bot.channels.cache.get(logs).send(logembed);
  }
};
