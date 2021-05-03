/* eslint-disable max-nested-callbacks */
/* eslint-disable consistent-return */
const Event = require('../../Structures/Event');
const SQLite = require('better-sqlite3');
const db = new SQLite('./Storage/DB/db.sqlite');
const chalk = require('chalk');
const { MessageEmbed } = require('discord.js');
const moment = require('moment');
const { CronJob } = require('cron');

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

		// Database Creation
		// Birthday table
		const birthdaystable = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'birthdays\';').get();
		if (!birthdaystable['count(*)']) {
			this.client.logger.ready('birthdays table created!');
			db.prepare('CREATE TABLE birthdays (userid TEXT PRIMARY KEY, birthday TEXT, lastRun BLOB);').run();
			db.prepare('CREATE UNIQUE INDEX idx_birthdays_id ON birthdays (userid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// Birthday Config table
		const birthdayconfigtable = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'birthdayConfig\';').get();
		if (!birthdayconfigtable['count(*)']) {
			this.client.logger.ready('birthday config table created!');
			db.prepare('CREATE TABLE birthdayConfig (guildid TEXT PRIMARY KEY, channel TEXT, role TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_birthdayConfig_id ON birthdayConfig (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// Ban table
		const bantable = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'ban\';').get();
		if (!bantable['count(*)']) {
			this.client.logger.ready('ban table created!');
			db.prepare('CREATE TABLE ban (id TEXT PRIMARY KEY, guildid TEXT, userid TEXT, endtime TEXT, channel TEXT, username TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_ban_id ON ban (id);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// Mute table
		const mutetable = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'mute\';').get();
		if (!mutetable['count(*)']) {
			this.client.logger.ready('mute table created!');
			db.prepare('CREATE TABLE mute (id TEXT PRIMARY KEY, guildid TEXT, userid TEXT, endtime TEXT, channel TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_mute_id ON mute (id);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// Mute Role table
		const muteRole = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'muterole\';').get();
		if (!muteRole['count(*)']) {
			this.client.logger.ready('muterole table created!');
			db.prepare('CREATE TABLE muterole (guildid TEXT PRIMARY KEY, role TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_muterole_id ON muterole (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// Invite Manager table
		const inviteManager = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'invmanager\';').get();
		if (!inviteManager['count(*)']) {
			this.client.logger.ready('invmanager table created!');
			db.prepare('CREATE TABLE invmanager (guildid TEXT PRIMARY KEY, channel TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_invmanager_id ON invmanager (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// Level table
		const levelstatustable = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'level\';').get();
		if (!levelstatustable['count(*)']) {
			this.client.logger.ready('level table created!');
			db.prepare('CREATE TABLE level (guildid TEXT PRIMARY KEY, status TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_level_id ON level (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// Dad Bot Table
		const dadbot = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'dadbot\';').get();
		if (!dadbot['count(*)']) {
			this.client.logger.ready('dadbot table created!');
			db.prepare('CREATE TABLE dadbot (guildid TEXT PRIMARY KEY, status TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_dadbot_id ON dadbot (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// Membercount Table
		const memcount = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'membercount\';').get();
		if (!memcount['count(*)']) {
			this.client.logger.ready('membercount table created!');
			db.prepare('CREATE TABLE membercount (guildid TEXT PRIMARY KEY, status TEXT, channela TEXT, channelb TEXT, channelc TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_membercount_id ON membercount (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// Announcement Table
		const announcement = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'announcement\';').get();
		if (!announcement['count(*)']) {
			this.client.logger.ready('announcement table created!');
			db.prepare('CREATE TABLE announcement (msg TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_announcement_id ON announcement (msg);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// Music Table
		const music = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'music\';').get();
		if (!music['count(*)']) {
			this.client.logger.ready('music table created!');
			db.prepare('CREATE TABLE music (guildid TEXT PRIMARY KEY, role TEXT, channel BLOB);').run();
			db.prepare('CREATE UNIQUE INDEX idx_music_id ON music (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// RoleMenu Table
		const rolemenu = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'rolemenu\';').get();
		if (!rolemenu['count(*)']) {
			this.client.logger.ready('rolemenu table created!');
			db.prepare('CREATE TABLE rolemenu (guildid TEXT PRIMARY KEY, activeRoleMenuID TEXT, roleList BLOB);').run();
			db.prepare('CREATE UNIQUE INDEX idx_rolemenu_id ON rolemenu (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// setprefix table
		const setprefix = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'setprefix\';').get();
		if (!setprefix['count(*)']) {
			this.client.logger.ready('setprefix table created!');
			db.prepare('CREATE TABLE setprefix (guildid TEXT PRIMARY KEY, prefix TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_setprefix_id ON setprefix (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// setwelcome table
		const setwelcome = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'setwelcome\';').get();
		if (!setwelcome['count(*)']) {
			this.client.logger.ready('setwelcome table created!');
			db.prepare('CREATE TABLE setwelcome (guildid TEXT PRIMARY KEY, channel TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_setwelcome_id ON setwelcome (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// autorole table
		const autorole = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'autorole\';').get();
		if (!autorole['count(*)']) {
			this.client.logger.ready('autorole table created!');
			db.prepare('CREATE TABLE autorole (guildid TEXT PRIMARY KEY, role TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_autorole_id ON autorole (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// balance table
		const balancetable = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'balance\';').get();
		if (!balancetable['count(*)']) {
			this.client.logger.ready('balance table created!');
			db.prepare('CREATE TABLE balance (id TEXT PRIMARY KEY, user TEXT, guild TEXT, hourly INTEGER, daily INTEGER, weekly INTEGER, monthly INTEGER, stealcool INTEGER, fishcool INTEGER, farmcool INTEGER, boosts BLOB, items BLOB, harvested BLOB, cash INTEGER, bank INTEGER, total INTEGER, claimNewUser INTEGER, farmPlot BLOB, dmHarvest TEXT, harvestedCrops BLOB);').run();
			db.prepare('CREATE UNIQUE INDEX idx_balance_id ON balance (id);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		this.client.getBalance = db.prepare('SELECT * FROM balance WHERE id = ?');
		this.client.setBalance = db.prepare('INSERT OR REPLACE INTO balance (id, user, guild, hourly, daily, weekly, monthly, stealcool, fishcool, farmcool, boosts, items, cash, bank, total, claimNewUser, farmPlot) VALUES (@id, @user, @guild, @hourly, @daily, @weekly, @monthly, @stealcool, @fishcool, @farmcool, @boosts, @items, @cash, @bank, @total, @claimNewUser, @farmPlot);');
		this.client.setUserBalance = db.prepare('INSERT OR REPLACE INTO balance (id, user, guild, hourly, daily, weekly, monthly, stealcool, fishcool, farmcool, boosts, items, cash, bank, total, claimNewUser, farmPlot) VALUES (@id, @user, @guild, @hourly, @daily, @weekly, @monthly, @stealcool, @fishcool, @farmcool, @boosts, @items, @cash, @bank, @total, @claimNewUser, @farmPlot);');

		// scores table
		const table = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'scores\';').get();
		if (!table['count(*)']) {
			this.client.logger.ready('scores table created!');
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
			this.client.logger.ready('adsprot table created!');
			db.prepare('CREATE TABLE adsprot (guildid TEXT PRIMARY KEY, status TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_adsprot_id ON adsprot (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// logging table
		const loggingtable = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'logging\';').get();
		if (!loggingtable['count(*)']) {
			this.client.logger.ready('logging table created!');
			db.prepare('CREATE TABLE logging (guildid TEXT PRIMARY KEY, channel TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_logging_id ON logging (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}
		// Ticket Config Table
		const ticketConfigTable = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'ticketConfig\';').get();
		if (!ticketConfigTable['count(*)']) {
			this.client.logger.ready('ticketConfig table created!');
			db.prepare('CREATE TABLE ticketConfig (guildid TEXT PRIMARY KEY, category TEXT, log TEXT, role TEXT, ticketembed TEXT, ticketembedchan TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_ticketConfig_id ON ticketConfig (guildid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// Stored Tickets Table
		const ticketsTable = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = \'tickets\';').get();
		if (!ticketsTable['count(*)']) {
			this.client.logger.ready('tickets table created!');
			db.prepare('CREATE TABLE tickets (guildid TEXT, ticketid TEXT, authorid TEXT, reason TEXT, chanid TEXT);').run();
			db.prepare('CREATE UNIQUE INDEX idx_tickets_id ON tickets (ticketid);').run();
			db.pragma('synchronous = 1');
			db.pragma('journal_mode = wal');
		}

		// Initiate the Erela manager.
		this.client.manager.init(this.client.user.id);

		// Slash Commands
		const { GatewayServer } = require('slash-create');
		const path = require('path');

		this.client.slashClient
			.withServer(
				new GatewayServer(
					(handler) => this.client.ws.on('INTERACTION_CREATE', handler)
				)
			)
			.registerCommandsIn(path.join(__dirname, '../../Slash-Commands'))
			.syncCommands();
		this.client.slashClient
			.on('warn', m => this.client.logger.warn('slash-create warn:', m));
		this.client.slashClient
			.on('commandError', m => this.client.logger.error('slash-create commanderror:', m));
		this.client.slashClient
			.on('error', m => this.client.logger.error('slash-create error:', m));

		// Cooldowns
		const job = new CronJob('*/10 * * * * *', () => {
		/*
				// Mutes
				const grabMutes = db.prepare('SELECT * FROM mute').all();


				grabMutes.forEach(r => {
					const guild = grabClient.guilds.cache.get(r.guildid);
					if (!guild) return;

					const member = guild.members.cache.get(r.userid);
					if (!member) {
						db.prepare('DELETE FROM mute WHERE id = ?').run(`${member.guild.id}-${r.userid}`);
						return;
					}

					if (Date.now() > r.endtime) {
						const muteRoleGrab = db.prepare(`SELECT role FROM muterole WHERE guildid = ${member.guild.id}`).get();

						let muteRole;
						if (muteRoleGrab) {
							muteRole = member.guild.roles.cache.find((ro) => ro.id === muteRoleGrab.role);
						} else {
							muteRole = member.guild.roles.cache.find((x) => x.name === 'Muted');
						}
						const role = member.roles.cache.find((rol) => rol.id === muteRole.id);
						if (!role) {
							db.prepare('DELETE FROM mute WHERE id = ?').run(`${member.guild.id}-${r.userid}`);
							return;
						}

						try {
							member.roles.remove(role.id);
						} catch {
							db.prepare('DELETE FROM mute WHERE id = ?').run(`${member.guild.id}-${r.userid}`);
							return;
						}

						const channelGrab = db.prepare(`SELECT channel FROM mute WHERE id = ?`).get(`${member.guild.id}-${r.userid}`);
						const findChannel = grabClient.channels.cache.get(channelGrab.channel);

						const embed = new MessageEmbed()
							.setThumbnail(grabClient.user.displayAvatarURL())
							.setColor(grabClient.utils.color(member.guild.me.displayHexColor))
							.addField('Action | Un-Mute', [
								`**◎ User:** ${member}`,
								`**◎ Reason:** Mute time ended.`
							])
							.setTimestamp();
						findChannel.send(embed);

						db.prepare('DELETE FROM mute WHERE id = ?').run(`${member.guild.id}-${r.userid}`);

						const dbid = db.prepare(`SELECT channel FROM logging WHERE guildid = ${member.guild.id};`).get();
						if (!dbid) return;
						const dblogs = dbid.channel;
						const chnCheck = grabClient.channels.cache.get(dblogs);
						if (!chnCheck) {
							db.prepare('DELETE FROM logging WHERE guildid = ?').run(member.guild.id);
						}

						if (dbid) {
							grabClient.channels.cache.get(dblogs).send(embed);
						}
					}
				});*/

			// Bans
			const grabBans = db.prepare('SELECT * FROM ban').all();

			grabBans.forEach(r => {
				const guild = this.client.guilds.cache.get(r.guildid);
				if (!guild) return;

				guild.fetchBans().then(bans => {
					const userCheck = bans.filter(ban => ban.user.id === r.userid);
					if (!userCheck.first()) {
						db.prepare('DELETE FROM ban WHERE id = ?').run(`${guild.id}-${r.userid}`);
						return;
					}
				});

				if (Date.now() > r.endtime) {
					try {
						guild.members.unban(r.userid);
					} catch {
						db.prepare('DELETE FROM ban WHERE id = ?').run(`${guild.id}-${r.userid}`);
						return;
					}

					const channelGrab = db.prepare(`SELECT channel FROM ban WHERE id = ?`).get(`${guild.id}-${r.userid}`);
					const findChannel = this.client.channels.cache.get(channelGrab.channel);

					const embed = new MessageEmbed()
						.setThumbnail(this.client.user.displayAvatarURL())
						.setColor(this.client.utils.color(guild.me.displayHexColor))
						.addField('Action | Un-Ban', [
							`**◎ User:** ${r.username}`,
							`**◎ Reason:** Ban time ended.`
						])
						.setTimestamp();
					findChannel.send(embed);

					db.prepare('DELETE FROM mute WHERE id = ?').run(`${guild.id}-${r.userid}`);

					const dbid = db.prepare(`SELECT channel FROM logging WHERE guildid = ${guild.id};`).get();
					const dblogs = dbid.channel;
					const chnCheck = this.client.channels.cache.get(dblogs);
					if (!chnCheck) {
						db.prepare('DELETE FROM logging WHERE guildid = ?').run(guild.id);
					}

					if (dbid) {
						this.client.channels.cache.get(dblogs).send(embed);
					}
				}
			});

			// Birthdays
			const grabBdays = db.prepare('SELECT * FROM birthdays').all();
			const grabBdaysConfig = db.prepare('SELECT * FROM birthdayConfig').all();

			grabBdaysConfig.forEach(a => {
				const guild = this.client.guilds.cache.get(a.guildid);
				if (!guild) {
					db.prepare('DELETE FROM birthdayConfig WHERE guildid = ?').run(a.guildid);
					return;
				}
				// Cache users
				guild.members.fetch();

				const channel = guild.channels.cache.get(a.channel);
				if (!channel) {
					db.prepare('DELETE FROM birthdayConfig WHERE guildid = ?').run(a.guildid);
					return;
				}
				grabBdays.forEach(b => {
					const userids = b.userid;
					const foundUsers = guild.members.cache.filter(member => member.id === userids);

					foundUsers.forEach(c => {
						const user = guild.members.cache.get(c.user.id);
						const grabUser = db.prepare(`SELECT * FROM birthdays WHERE userid = ${c.user.id};`).get();

						const now = moment();

						let foundLastRun = JSON.parse(grabUser.lastRun);

						if (!foundLastRun) {
							foundLastRun = [];
						}

						if (foundLastRun.includes(`${guild.id}-${now.year().toString()}`)) return;

						const checkDate = new Date();
						checkDate.setFullYear('2018');
						checkDate.setHours('0');
						checkDate.setMilliseconds('0');
						checkDate.setSeconds('0');
						checkDate.setMinutes('0');

						const savedDate = new Date(grabUser.birthday);
						savedDate.setFullYear('2018');
						savedDate.setHours('0');
						savedDate.setMilliseconds('0');
						savedDate.setSeconds('0');
						savedDate.setMinutes('0');

						if (checkDate.getTime() === savedDate.getTime()) {
							let msg;

							const role = guild.roles.cache.get(a.role);

							if (role) {
								msg = `It's ${user}'s birthday! ${role} Say Happy Birthday! 🍰`;
							} else {
								msg = `It's ${user}'s birthday! Say Happy Birthday! 🍰`;
							}
							channel.send(msg);

							const lastYear = now.year() - 1;
							if (foundLastRun.includes(`${guild.id}-${lastYear}`)) {
								const findString = foundLastRun.indexOf(`${guild.id}-${lastYear}`);
								foundLastRun[findString] = `${guild.id}-${now.year().toString()}`;
							} else {
								foundLastRun.push(`${guild.id}-${now.year().toString()}`);
							}

							db.prepare('UPDATE birthdays SET lastRun = (@lastRun);').run({
								lastRun: JSON.stringify(foundLastRun)
							});
							return;
						}
					});
				});
			});

			// Economy
			const grabEconomy = db.prepare('SELECT * FROM balance').all();

			grabEconomy.forEach(r => {
				const guild = this.client.guilds.cache.get(r.guild);
				if (!guild) return;

				guild.members.fetch();

				const user = guild.members.cache.get(r.user);
				if (!user) return;

				let foundPlotList = JSON.parse(r.farmPlot);

				if (!foundPlotList) {
					foundPlotList = [];
				}

				foundPlotList.forEach(key => {
					if (Date.now() > key.cropGrowTime) {
						key.cropStatus = 'harvest';
						key.cropGrowTime = 'na';
						key.decay = 0;

						db.prepare('UPDATE balance SET farmPlot = (@farmPlot) WHERE id = (@id);').run({
							farmPlot: JSON.stringify(foundPlotList),
							id: `${user.id}-${guild.id}`
						});
					}

					if (key.cropStatus === 'harvest') {
						if (key.decay >= 100) {
							foundPlotList = foundPlotList.filter(a => a.decay <= 100);

							if (foundPlotList.length <= 0) {
								db.prepare('UPDATE balance SET farmPlot = (@farmPlot) WHERE id = (@id);').run({
									farmPlot: null,
									id: `${user.id}-${guild.id}`
								});
								return;
							}

							db.prepare('UPDATE balance SET farmPlot = (@farmPlot) WHERE id = (@id);').run({
								farmPlot: JSON.stringify(foundPlotList),
								id: `${user.id}-${guild.id}`
							});
							return;
						}

						key.decay += Number(this.client.ecoPrices.decayRate);

						db.prepare('UPDATE balance SET farmPlot = (@farmPlot) WHERE id = (@id);').run({
							farmPlot: JSON.stringify(foundPlotList),
							id: `${user.id}-${guild.id}`
						});
					}
				});
			});
		}, null, true);
		job.start();
	}

};
