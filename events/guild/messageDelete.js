const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, message) => {
  if (message.author.bot) return;
  const id = db
    .prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`)
    .get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;

  const fetchedLogs = await message.guild.fetchAuditLogs({
    limit: 1,
    type: 'MESSAGE_DELETE',
  });
  const deletionLog = fetchedLogs.entries.first();

  // Check if message deleted was a command, return if it was

  const cmd = message.content.substring(1).replace(/ .*/, '').toLowerCase();
  const commandfile = bot.commands.get(cmd) || bot.commands.get(bot.aliases.get(cmd));
  if (commandfile) {
    return;
  }

  if (!deletionLog) {
    const noLogE = new MessageEmbed()
      .setAuthor('Message Deleted')
      .setDescription(
        `**A message sent by <@${message.author.id}> was deleted but no content was found.**`,
      )
      .setTimestamp();
    bot.channels.cache.get(logs).send(noLogE);
    return;
  }

  const logembed = new MessageEmbed()
    .setAuthor('Message Deleted')
    .setDescription(
      `**Message sent by <@${message.author.id}> deleted in <#${
        message.channel.id
      }>** \n ${message.content}`,
    )
    .setColor(message.guild.member(bot.user).displayHexColor)
    .setFooter(`ID: ${message.channel.id}`)
    .setTimestamp();
  bot.channels.cache.get(logs).send(logembed);
};
