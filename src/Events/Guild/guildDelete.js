import SQLite from 'better-sqlite3';
import { ActivityType } from 'discord.js';
import Event from '../../Structures/Event.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const EventF = class extends Event {
  async run(guild) {
    // when the bot is removed from a guild.
    console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
    this.client.user.setActivity(
      `${this.client.prefix}help | ${this.client.guilds.cache.size.toLocaleString('en')} Guilds ${this.client.guilds.cache
        .reduce((a, b) => a + b.memberCount, 0)
        .toLocaleString('en')} Users`,
      {
        type: ActivityType.Watching
      }
    );

    // adsprot table
    const delads = db.prepare('SELECT count(*) FROM adsprot WHERE guildid = ?;').get(guild.id);
    if (delads['count(*)']) {
      db.prepare('DELETE FROM adsprot WHERE guildid = ?').run(guild.id);
    }

    // autorole table
    const delaut = db.prepare('SELECT count(*) FROM autorole WHERE guildid = ?;').get(guild.id);
    if (delaut['count(*)']) {
      db.prepare('DELETE FROM autorole WHERE guildid = ?').run(guild.id);
    }

    // ban table
    const delban = db.prepare('SELECT count(*) FROM ban WHERE guildid = ?;').get(guild.id);
    if (delban['count(*)']) {
      db.prepare('DELETE FROM ban WHERE guildid = ?').run(guild.id);
    }

    // birthdayConfig table
    const delbdayconf = db.prepare('SELECT count(*) FROM birthdayConfig WHERE guildid = ?;').get(guild.id);
    if (delbdayconf['count(*)']) {
      db.prepare('DELETE FROM birthdayConfig WHERE guildid = ?').run(guild.id);
    }

    // dadbot table
    const deldad = db.prepare('SELECT count(*) FROM dadbot WHERE guildid = ?;').get(guild.id);
    if (deldad['count(*)']) {
      db.prepare('DELETE FROM dadbot WHERE guildid = ?').run(guild.id);
    }

    // hastebin table
    const delhaste = db.prepare('SELECT count(*) FROM hastebin WHERE guildid = ?;').get(guild.id);
    if (delhaste['count(*)']) {
      db.prepare('DELETE FROM hastebin WHERE guildid = ?').run(guild.id);
    }

    // logging table
    const dellog = db.prepare('SELECT count(*) FROM logging WHERE guildid = ?;').get(guild.id);
    if (dellog['count(*)']) {
      db.prepare('DELETE FROM logging WHERE guildid = ?').run(guild.id);
    }

    // rolemenu table
    const delrol = db.prepare('SELECT count(*) FROM rolemenu WHERE guildid = ?;').get(guild.id);
    if (delrol['count(*)']) {
      db.prepare('DELETE FROM rolemenu WHERE guildid = ?').run(guild.id);
    }

    // setwelcome table
    const delwel = db.prepare('SELECT count(*) FROM setwelcome WHERE guildid = ?;').get(guild.id);
    if (delwel['count(*)']) {
      db.prepare('DELETE FROM setwelcome WHERE guildid = ?').run(guild.id);
    }

    // ticketConfig table
    const deltic = db.prepare('SELECT count(*) FROM ticketConfig WHERE guildid = ?;').get(guild.id);
    if (deltic['count(*)']) {
      db.prepare('DELETE FROM ticketConfig WHERE guildid = ?').run(guild.id);
    }

    // tickets table
    const delticlog = db.prepare('SELECT count(*) FROM tickets WHERE guildid = ?;').get(guild.id);
    if (delticlog['count(*)']) {
      db.prepare('DELETE FROM tickets WHERE guildid = ?').run(guild.id);
    }

    // starboard table
    const delstarboard = db.prepare('SELECT count(*) FROM starboard WHERE guildid = ?;').get(guild.id);
    if (delstarboard['count(*)']) {
      db.prepare('DELETE FROM starboard WHERE guildid = ?').run(guild.id);
    }
  }
};

export default EventF;
