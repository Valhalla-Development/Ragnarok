const { prefix } = require('../../storage/config.json');
const SQLite = require('better-sqlite3');
const db = new SQLite('./storage/db/db.sqlite');

module.exports = async bot => {
	console.log(
		`Scanning for guilds...\n\x1b[36m[-]\x1b[0m ${bot.guilds
			.cache.map(n => n.name + ` (ID: \x1b[36m${n.id}\x1b[0m)`)
			.join('\x1b[36m\n[-]\x1b[0m ')}`
	);

	setTimeout(() => {
		console.log(
			`Invite link: https://discordapp.com/oauth2/authorize?client_id=${
				bot.user.id
			}&scope=bot&permissions=8\n`
		);
	}, 1000);

	// activity

	bot.user.setActivity(
		`${prefix}help | ${(bot.guilds.cache.size).toLocaleString('en')} Guilds ${(bot.users.cache.size).toLocaleString('en')} Users`,
		{
			type: 'WATCHING',
		}
	);

	// Database Creation
	// RoleMenu Table
	const rolemenu = db
		.prepare(
			'SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'rolemenu\';'
		)
		.get();
	if (!rolemenu['count(*)']) {
		console.log('rolemenu table created!');
		db.prepare(
			'CREATE TABLE rolemenu (guildid TEXT PRIMARY KEY, activeRoleMenuID TEXT, roleList BLOB);'
		).run();
		db.prepare(
			'CREATE UNIQUE INDEX idx_rolemenu_id ON rolemenu (guildid);'
		).run();
		db.pragma('synchronous = 1');
		db.pragma('journal_mode = wal');
	}
	// setprefix table
	const setprefix = db
		.prepare(
			'SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'setprefix\';'
		)
		.get();
	if (!setprefix['count(*)']) {
		console.log('setprefix table created!');
		db.prepare(
			'CREATE TABLE setprefix (guildid TEXT PRIMARY KEY, prefix TEXT);'
		).run();
		db.prepare(
			'CREATE UNIQUE INDEX idx_setprefix_id ON setprefix (guildid);'
		).run();
		db.pragma('synchronous = 1');
		db.pragma('journal_mode = wal');
	}
	// setwelcome table
	const setwelcome = db
		.prepare(
			'SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'setwelcome\';'
		)
		.get();
	if (!setwelcome['count(*)']) {
		console.log('setwelcome table created!');
		db.prepare(
			'CREATE TABLE setwelcome (guildid TEXT PRIMARY KEY, channel TEXT);'
		).run();
		db.prepare(
			'CREATE UNIQUE INDEX idx_setwelcome_id ON setwelcome (guildid);'
		).run();
		db.pragma('synchronous = 1');
		db.pragma('journal_mode = wal');
	}
	// autorole table
	const autorole = db
		.prepare(
			'SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'autorole\';'
		)
		.get();
	if (!autorole['count(*)']) {
		console.log('autorole table created!');
		db.prepare(
			'CREATE TABLE autorole (guildid TEXT PRIMARY KEY, role TEXT);'
		).run();
		db.prepare(
			'CREATE UNIQUE INDEX idx_autorole_id ON autorole (guildid);'
		).run();
		db.pragma('synchronous = 1');
		db.pragma('journal_mode = wal');
	}
	// balance table
	const balancetable = db
		.prepare(
			'SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'balance\';'
		)
		.get();
	if (!balancetable['count(*)']) {
		console.log('balance table created!');
		db.prepare(
			'CREATE TABLE balance (id TEXT PRIMARY KEY, user TEXT, guild TEXT, balance INTEGER);'
		).run();
		db.prepare('CREATE UNIQUE INDEX idx_balance_id ON balance (id);').run();
		db.pragma('synchronous = 1');
		db.pragma('journal_mode = wal');
	}
	bot.getBalance = db.prepare(
		'SELECT * FROM balance WHERE user = ? AND guild = ?'
	);
	bot.setBalance = db.prepare(
		'INSERT OR REPLACE INTO balance (id, user, guild, balance) VALUES (@id, @user, @guild, @balance);'
	);
	// scores table
	const table = db
		.prepare(
			'SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'scores\';'
		)
		.get();
	if (!table['count(*)']) {
		console.log('scores table created!');
		db.prepare(
			'CREATE TABLE scores (id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER, level INTEGER);'
		).run();
		db.prepare('CREATE UNIQUE INDEX idx_scores_id ON scores (id);').run();
		db.pragma('synchronous = 1');
		db.pragma('journal_mode = wal');
	}
	bot.getScore = db.prepare(
		'SELECT * FROM scores WHERE user = ? AND guild = ?'
	);
	bot.setScore = db.prepare(
		'INSERT OR REPLACE INTO scores (id, user, guild, points, level) VALUES (@id, @user, @guild, @points, @level);'
	);
	// adsprot table
	const adsprottable = db
		.prepare(
			'SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'adsprot\';'
		)
		.get();
	if (!adsprottable['count(*)']) {
		console.log('adsprot table created!');
		db.prepare(
			'CREATE TABLE adsprot (guildid TEXT PRIMARY KEY, status TEXT);'
		).run();
		db.prepare(
			'CREATE UNIQUE INDEX idx_adsprot_id ON adsprot (guildid);'
		).run();
		db.pragma('synchronous = 1');
		db.pragma('journal_mode = wal');
	}
	// logging table
	const loggingtable = db
		.prepare(
			'SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'logging\';'
		)
		.get();
	if (!loggingtable['count(*)']) {
		console.log('logging table created!');
		db.prepare(
			'CREATE TABLE logging (guildid TEXT PRIMARY KEY, channel TEXT);'
		).run();
		db.prepare(
			'CREATE UNIQUE INDEX idx_logging_id ON logging (guildid);'
		).run();
		db.pragma('synchronous = 1');
		db.pragma('journal_mode = wal');
	}
	// Ticket Config Table
	const ticketConfigTable = db
		.prepare(
			'SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'ticketConfig\';'
		)
		.get();
	if (!ticketConfigTable['count(*)']) {
		console.log('ticketConfig table created!');
		db.prepare(
			'CREATE TABLE ticketConfig (guildid TEXT PRIMARY KEY, category TEXT, log TEXT, role TEXT);'
		).run();
		db.prepare(
			'CREATE UNIQUE INDEX idx_ticketConfig_id ON ticketConfig (guildid);'
		).run();
		db.pragma('synchronous = 1');
		db.pragma('journal_mode = wal');
	}
	// Stored Tickets Table
	const ticketsTable = db
		.prepare(
			'SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'tickets\';'
		)
		.get();
	if (!ticketsTable['count(*)']) {
		console.log('tickets table created!');
		db.prepare(
			'CREATE TABLE tickets (guildid TEXT, ticketid TEXT, authorid TEXT, reason TEXT, chanid TEXT);'
		).run();
		db.prepare(
			'CREATE UNIQUE INDEX idx_tickets_id ON tickets (ticketid);'
		).run();
		db.pragma('synchronous = 1');
		db.pragma('journal_mode = wal');
	}
};
