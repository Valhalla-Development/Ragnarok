const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const { color, prefix } = require('../../storage/config.json');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, member) => {

  bot.user.setActivity(
    `${prefix}help | ${(bot.guilds.cache.size).toLocaleString('en')} Guilds ${(bot.users.cache.size).toLocaleString('en')} Users`,
    {
      type: 'WATCHING',
    },
  );

  const id = db
    .prepare(`SELECT channel FROM logging WHERE guildid = ${member.guild.id};`)
    .get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;
  const logembed = new MessageEmbed()
    .setAuthor('Member Joined', member.user.avatarURL())
    .setDescription(`<@${member.user.id}> - ${member.user.tag}`)
    .setColor(color)
    .setFooter(`ID: ${member.user.id}`)
    .setTimestamp();
  bot.channels.cache.get(logs).send(logembed);
};
