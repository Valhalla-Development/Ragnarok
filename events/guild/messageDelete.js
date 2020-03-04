const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, message) => {
  if (bot.guilds.cache.get('343572980351107077')) return; // REMOVE, this is for bug testing

  if (message.author.bot) return;
  const id = db
    .prepare(`SELECT channel FROM logging WHERE guildid = ${message.guild.id};`)
    .get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  const entry = await message.guild
    .fetchAuditLogs({
      type: 'MESSAGE_DELETE',
    })
    .then((audit) => audit.entries.first());
  let user = '';
  if (
    entry.extra.channel.id === message.channel.id && entry.target.id === message.author.id && entry.createdTimestamp > Date.now() - 5000 && entry.extra.count >= 1
  ) {
    user = entry.executor.username;
  } else {
    user = message.author.username;
  }
  const logembed = new MessageEmbed()
    .setAuthor(user, message.author.displayAvatarURL())
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
