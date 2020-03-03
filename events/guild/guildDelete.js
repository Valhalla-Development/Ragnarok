const SQLite = require('better-sqlite3');
const { prefix } = require('../../storage/config.json');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async (bot, guild) => {
  // when the bot is removed from a guild.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
  bot.user.setActivity(
    `${prefix}help | ${(bot.guilds.cache.size).toLocaleString('en')} Guilds ${(bot.users.cache.size).toLocaleString('en')} Users`,
    {
      type: 'WATCHING',
    },
  );
  // setprefix table
  const delpre = db
    .prepare('SELECT count(*) FROM setprefix WHERE guildid = ?;')
    .get(guild.id);
  if (delpre['count(*)']) {
    db.prepare('DELETE FROM setprefix WHERE guildid = ?').run(guild.id);
  }
  // setwelcome table
  const delwel = db
    .prepare('SELECT count(*) FROM setwelcome WHERE guildid = ?;')
    .get(guild.id);
  if (delwel['count(*)']) {
    db.prepare('DELETE FROM setwelcome WHERE guildid = ?').run(guild.id);
  }
  // autorole table
  const delaut = db
    .prepare('SELECT count(*) FROM autorole WHERE guildid = ?;')
    .get(guild.id);
  if (delaut['count(*)']) {
    db.prepare('DELETE FROM autorole WHERE guildid = ?').run(guild.id);
  }
  // adsprot table
  const delads = db
    .prepare('SELECT count(*) FROM adsprot WHERE guildid = ?;')
    .get(guild.id);
  if (delads['count(*)']) {
    db.prepare('DELETE FROM adsprot WHERE guildid = ?').run(guild.id);
  }
  // logging table
  const dellog = db
    .prepare('SELECT count(*) FROM logging WHERE guildid = ?;')
    .get(guild.id);
  if (dellog['count(*)']) {
    db.prepare('DELETE FROM logging WHERE guildid = ?').run(guild.id);
  }
  // ticketConfig table
  const deltic = db
    .prepare('SELECT count(*) FROM ticketConfig WHERE guildid = ?;')
    .get(guild.id);
  if (deltic['count(*)']) {
    db.prepare('DELETE FROM ticketConfig WHERE guildid = ?').run(guild.id);
  }
  // tickets table
  const delticlog = db
    .prepare('SELECT count(*) FROM tickets WHERE guildid = ?;')
    .get(guild.id);
  if (delticlog['count(*)']) {
    db.prepare('DELETE FROM tickets WHERE guildid = ?').run(guild.id);
  }
};
