const Event = require('../../Structures/Event');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');

module.exports = class extends Event {

	async run(guild) {
		// when the bot is removed from a guild.
		console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`);
		this.client.user.setActivity(`${this.prefix}help | ${this.client.guilds.cache.size.toLocaleString('en')} Guilds ${this.client.users.cache.size.toLocaleString('en')} Users`,
			{
				type: 'WATCHING'
			}
		);
		// membercount table
		const delmem = db
			.prepare('SELECT count(*) FROM membercount WHERE guildid = ?;')
			.get(guild.id);
		if (delmem['count(*)']) {
			db.prepare('DELETE FROM membercount WHERE guildid = ?').run(guild.id);
		}
		// music table
		const delmus = db
			.prepare('SELECT count(*) FROM music WHERE guildid = ?;')
			.get(guild.id);
		if (delmus['count(*)']) {
			db.prepare('DELETE FROM music WHERE guildid = ?').run(guild.id);
		}
		// rolemenu table
		const delrol = db
			.prepare('SELECT count(*) FROM rolemenu WHERE guildid = ?;')
			.get(guild.id);
		if (delrol['count(*)']) {
			db.prepare('DELETE FROM rolemenu WHERE guildid = ?').run(guild.id);
		}
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
	}

};
