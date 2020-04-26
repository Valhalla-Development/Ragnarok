const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const { prefix } = require('../../storage/config.json');
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
  if (id) {
    const logs = id.channel;
    if (logs) {
      const logembed = new MessageEmbed()
        .setAuthor('Member Left', member.user.avatarURL())
        .setDescription(`<@${member.user.id}> - ${member.user.tag}`)
        .setColor('990000')
        .setFooter(`ID: ${member.user.id}`)
        .setTimestamp();
      bot.channels.cache.get(logs).send(logembed);
    }
  }

  // Member Count
  const memStat = db.prepare(`SELECT * FROM membercount WHERE guildid = ${member.guild.id};`).get();
  if (memStat) {
    const channelA = bot.channels.cache.find((a) => a.id === memStat.channela);
    const channelB = bot.channels.cache.find((b) => b.id === memStat.channelb);
    const channelC = bot.channels.cache.find((c) => c.id === memStat.channelc);

    if (channelA) {
      channelA.setName(`Users: ${(member.guild.memberCount - member.guild.members.cache.filter((m) => m.user.bot).size).toLocaleString('en')}`);
    } else {
      db.prepare('DELETE FROM membercount WHERE guildid = ?').run(member.guild.id);
    }
    if (channelB) {
      channelB.setName(`Bots: ${member.guild.members.cache.filter((m) => m.user.bot).size}`);
    } else {
      db.prepare('DELETE FROM membercount WHERE guildid = ?').run(member.guild.id);
    }
    if (channelC) {
      channelC.setName(`Total: ${(member.guild.memberCount).toLocaleString('en')}`);
    } else {
      db.prepare('DELETE FROM membercount WHERE guildid = ?').run(member.guild.id);
    }
  }
};
