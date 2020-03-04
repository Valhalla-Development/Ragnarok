const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, oldMessage, newMessage) => {
  if (bot.guilds.cache.get('343572980351107077')) return; // REMOVE, this is for bug testing

  if (
    newMessage.content.includes('https://') || newMessage.content.includes('http://') || newMessage.content.includes('discord.gg') || newMessage.content.includes('discord.me') || newMessage.content.includes('discord.io')
  ) {
    const adsprot = db
      .prepare('SELECT count(*) FROM adsprot WHERE guildid = ?')
      .get(newMessage.guild.id);
    if (!adsprot['count(*)']) {
      return;
    }
    if (newMessage.member.hasPermission('MANAGE_GUILD')) { return; }
    newMessage.delete();
    newMessage.channel
      .send(
        `**Your message contained a link and it was deleted, <@${
          newMessage.author.id
        }>**`,
      )
      .then((msg) => {
        msg.delete({
          timeout: 10000,
        });
      });
  }
};
