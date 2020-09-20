/* eslint-disable consistent-return */
const Event = require('../../Structures/Event');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const chalk = require('chalk');

module.exports = class extends Event {

	constructor(...args) {
		super(...args, {
			once: true
		});
	}

	run() {
		console.log([
			`${chalk.whiteBright('Logged in as')} ${chalk.red.bold.underline(`${this.client.user.tag}`)}`,
			`${chalk.whiteBright('Loaded')} ${chalk.red.bold(`${this.client.commands.size}`)} ${chalk.whiteBright('commands!')}`,
			`${chalk.whiteBright('Loaded')} ${chalk.red.bold(`${this.client.events.size}`)} ${chalk.whiteBright('events!')}`,
			`${chalk.whiteBright('I am currently in')} ${chalk.red.bold(`${this.client.guilds.cache.size.toLocaleString('en')}`)} ${chalk.whiteBright('guilds!')}`,
			`${chalk.whiteBright('I currently serve')} ${chalk.red.bold(`${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')}`)} ${chalk.whiteBright('users!')}`,
			`\u3000`,
			`Scanning for guilds...\n\x1b[31m[-]\x1b[0m ${this.client.guilds.cache.map((n) => `${n.name} (ID: \x1b[31m${n.id}\x1b[0m)`).join('\x1b[31m\n[-]\x1b[0m ')}`
		].join('\n'));

		setTimeout(() => {
			console.log(`Invite link: ${chalk.blue.bold.underline(`https://discordapp.com/oauth2/authorize?client_id=${this.client.user.id}&scope=bot&permissions=2050485471`)}\n`);
		}, 1000);

		this.client.user.setActivity(`${this.client.prefix}help | ${this.client.guilds.cache.size.toLocaleString('en')} Guilds ${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')} Users`,
			{
				type: 'WATCHING'
			}
		);

		// Initiate the Erela manager.
		this.client.manager.init(this.client.user.id);

		// Invite Manager
		for (const guild of this.client.guilds.cache.values()) {
			guild.fetchInvites()
				.then(invite => this.client.invites.set(guild.id, invite))
				.catch(error => console.log(error));
		}

		// Database Creation

		// Invite Manager table
		const inviteManager = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'invmanager\';').get();
		if (!inviteManager['count(*)']) {
			console.log('invmanager table created!');
			db.prepare('CREATE TABLE invmanager (guildid TEXT PRIMARY KEY, channel TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_invmanager_id ON invmanager (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// Level table
		const levelstatustable = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'level\';').get();
		if (!levelstatustable['count(*)']) {
			console.log('level table created!');
			db.prepare('CREATE TABLE level (guildid TEXT PRIMARY KEY, status TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_level_id ON level (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// Dad Bot Table
		const dadbot = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'dadbot\';').get();
		if (!dadbot['count(*)']) {
			console.log('dadbot table created!');
			db.prepare('CREATE TABLE dadbot (guildid TEXT PRIMARY KEY, status TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_dadbot_id ON dadbot (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// Membercount Table
		const memcount = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'membercount\';').get();
		if (!memcount['count(*)']) {
			console.log('membercount table created!');
			db.prepare('CREATE TABLE membercount (guildid TEXT PRIMARY KEY, status TEXT, channela TEXT, channelb TEXT, channelc TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_membercount_id ON membercount (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// Announcement Table
		const announcement = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'announcement\';').get();
		if (!announcement['count(*)']) {
			console.log('announcement table created!');
			db.prepare('CREATE TABLE announcement (msg TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_announcement_id ON announcement (msg);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// Music Table
		const music = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'music\';').get();
		if (!music['count(*)']) {
			console.log('music table created!');
			db.prepare('CREATE TABLE music (guildid TEXT PRIMARY KEY, role TEXT, channel BLOB);').run();
			db.prepare('CREATE UNIQUE INDEX idx_music_id ON music (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// RoleMenu Table
		const rolemenu = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'rolemenu\';').get();
		if (!rolemenu['count(*)']) {
			console.log('rolemenu table created!');
			db.prepare('CREATE TABLE rolemenu (guildid TEXT PRIMARY KEY, activeRoleMenuID TEXT, roleList BLOB);').run();
			db.prepare('CREATE UNIQUE INDEX idx_rolemenu_id ON rolemenu (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// setprefix table
		const setprefix = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'setprefix\';').get();
		if (!setprefix['count(*)']) {
			console.log('setprefix table created!');
			db.prepare('CREATE TABLE setprefix (guildid TEXT PRIMARY KEY, prefix TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_setprefix_id ON setprefix (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// setwelcome table
		const setwelcome = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'setwelcome\';').get();
		if (!setwelcome['count(*)']) {
			console.log('setwelcome table created!');
			db.prepare('CREATE TABLE setwelcome (guildid TEXT PRIMARY KEY, channel TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_setwelcome_id ON setwelcome (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// autorole table
		const autorole = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'autorole\';').get();
		if (!autorole['count(*)']) {
			console.log('autorole table created!');
			db.prepare('CREATE TABLE autorole (guildid TEXT PRIMARY KEY, role TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_autorole_id ON autorole (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// balance table
		const balancetable = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'balance\';').get();
		if (!balancetable['count(*)']) {
			console.log('balance table created!');
			db.prepare('CREATE TABLE balance (user TEXT PRIMARY KEY, guild TEXT, boosts TEXT, cash INTEGER, bank INTEGER, total INTEGER);').run();
			db.prepare('CREATE UNIQUE INDEX idx_balance_id ON balance (user);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		this.client.getBalance = db.prepare('SELECT * FROM balance WHERE user = ? AND guild = ?');
		this.client.setBalance = db.prepare('INSERT OR REPLACE INTO balance (user, guild, cash, bank, total) VALUES (@user, @guild, @cash, @bank, @total);');
		this.client.setUserBalance = db.prepare('INSERT OR REPLACE INTO balance (user, guild, cash, bank, total) VALUES (@user, @guild, @cash, @bank, @total);');

		// scores table
		const table = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'scores\';').get();
		if (!table['count(*)']) {
			console.log('scores table created!');
			db.prepare('CREATE TABLE scores (id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER, level INTEGER);').run();
			db.prepare('CREATE UNIQUE INDEX idx_scores_id ON scores (id);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		this.client.getScore = db.prepare('SELECT * FROM scores WHERE user = ? AND guild = ?');
		this.client.setScore = db.prepare('INSERT OR REPLACE INTO scores (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);');

		// adsprot table
		const adsprottable = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'adsprot\';').get();
		if (!adsprottable['count(*)']) {
			console.log('adsprot table created!');
			db.prepare('CREATE TABLE adsprot (guildid TEXT PRIMARY KEY, status TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_adsprot_id ON adsprot (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// logging table
		const loggingtable = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'logging\';').get();
		if (!loggingtable['count(*)']) {
			console.log('logging table created!');
			db.prepare('CREATE TABLE logging (guildid TEXT PRIMARY KEY, channel TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_logging_id ON logging (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}
		// Ticket Config Table
		const ticketConfigTable = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'ticketConfig\';').get();
		if (!ticketConfigTable['count(*)']) {
			console.log('ticketConfig table created!');
			db.prepare('CREATE TABLE ticketConfig (guildid TEXT PRIMARY KEY, category TEXT, log TEXT, role TEXT, ticketembed TEXT, ticketembedchan TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_ticketConfig_id ON ticketConfig (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// Stored Tickets Table
		const ticketsTable = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'tickets\';').get();
		if (!ticketsTable['count(*)']) {
			console.log('tickets table created!');
			db.prepare('CREATE TABLE tickets (guildid TEXT, ticketid TEXT, authorid TEXT, reason TEXT, chanid TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_tickets_id ON tickets (ticketid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}
	}

};
