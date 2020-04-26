const { MessageEmbed } = require('discord.js');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, oldMessage, newMessage) => {
  const adsprot = db.prepare('SELECT count(*) FROM adsprot WHERE guildid = ?').get(newMessage.guild.id);
  if (!adsprot['count(*)']) {
    return;
  }
  if (newMessage.content.includes('https://') || newMessage.content.includes('http://') || newMessage.content.includes('discord.gg') || newMessage.content.includes('discord.me') || newMessage.content.includes('discord.io')) {
    if (newMessage.member.hasPermission('MANAGE_GUILD')) {
      return;
    }
    newMessage.delete();
    newMessage.channel.send(`**Your message contained a link and it was deleted, <@${newMessage.author.id}>**`)
      .then((msg) => {
        msg.delete({ timeout: 10000 });
      });
  }


  const id = db
    .prepare(`SELECT channel FROM logging WHERE guildid = ${oldMessage.guild.id};`)
    .get();
  if (!id) return;
  const logs = id.channel;
  if (!logs) return;

  if (oldMessage.content.length === 0) {
    return;
  }
  if (oldMessage.author.bot === true) {
    return;
  }
  if (oldMessage.content === newMessage.content) {
    return;
  }
  const embed = new MessageEmbed()
    .setAuthor(`${oldMessage.author.username}#${oldMessage.author.discriminator}`, oldMessage.author.avatarURL())
    .setColor('#990000')
    .setDescription(`Message edited in ${oldMessage.channel} [Jump to Message](https://discordapp.com/channels/${newMessage.guild.id}/${newMessage.channel.id}/${oldMessage.id})`)
    .addFields({ name: 'Before', value: `${oldMessage.content}` },
      { name: 'After', value: `${newMessage.content}` });
  bot.channels.cache.get(logs).send(embed);
};
