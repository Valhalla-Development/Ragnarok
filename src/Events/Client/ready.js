/* eslint-disable no-param-reassign */
import SQLite from 'better-sqlite3';
import chalk from 'chalk';
import { EmbedBuilder, ActivityType } from 'discord.js';
import moment from 'moment';
import { CronJob } from 'cron';
import fetch from 'node-fetch';
import { load } from 'cheerio';
import Event from '../../Structures/Event.js';

const db = new SQLite('./Storage/DB/db.sqlite');

export const EventF = class extends Event {
  constructor(...args) {
    super(...args, {
      once: true
    });
  }

  async run() {
    console.log(
      `${chalk.whiteBright('Logged in as')} ${chalk.red.bold.underline(this.client.user.tag)}\n`,
      `${chalk.whiteBright('Loaded')} ${chalk.red.bold(this.client.events.size)} ${chalk.whiteBright('events!')}\n`,
      `${chalk.whiteBright('I am currently in')} ${chalk.red.bold(this.client.guilds.cache.size.toLocaleString('en'))} ${chalk.whiteBright(
        'guilds!'
      )}\n`,
      `${chalk.whiteBright('I currently serve')} ${chalk.red.bold(
        this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')
      )} ${chalk.whiteBright('users!')}\n`,
      '\u3000\n',
      'Scanning for guilds...'
    );
    console.table(
      this.client.guilds.cache.map((guild) => ({
        Name: guild.name,
        ID: guild.id
      }))
    );

    setTimeout(() => {
      console.log(
        `Invite Link: ${chalk.blue.bold.underline(
          `https://discordapp.com/oauth2/authorize?client_id=${this.client.user.id}&scope=bot&permissions=2050485471`
        )}\n`
      );
    }, 1000);

    this.client.user.setActivity(
      `/help |
  ${this.client.guilds.cache.size.toLocaleString('en')} Guilds
  ${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')} Users`,
      {
        type: ActivityType.Watching
      }
    );

    // Database Creation
    async function createTableIfNotExists(tableName, tableSchema, unique) {
      const tableExists = db.prepare('SELECT count(*) FROM sqlite_master WHERE type=\'table\' AND name = ?').get(tableName);
      if (!tableExists['count(*)']) {
        console.log(`${tableName} table created!`);
        await db.prepare(`CREATE TABLE IF NOT EXISTS ${tableName} ${tableSchema}`).run();
        await db.prepare(`CREATE UNIQUE INDEX idx_${tableName}_id ON ${tableName} (${unique})`).run();
        await db.pragma('synchronous', { value: 1 });
        await db.pragma('journal_mode', { value: 'wal' });
      }
    }

    // Birthday table
    await createTableIfNotExists('birthdays', '(userid TEXT PRIMARY KEY, birthday TEXT, lastRun BLOB)', 'userid');

    // Birthday Config table
    await createTableIfNotExists('birthdayConfig', '(guildid TEXT PRIMARY KEY, channel TEXT, role TEXT)', 'guildid');

    // Ban table
    await createTableIfNotExists('ban', '(id TEXT PRIMARY KEY, guildid TEXT, userid TEXT, endtime TEXT, channel TEXT, username TEXT)', 'id');

    // Level table
    await createTableIfNotExists('level', '(guildid TEXT PRIMARY KEY, status TEXT)', 'guildid');

    // Hastebin Table
    await createTableIfNotExists('hastebin', '(guildid TEXT PRIMARY KEY, status TEXT)', 'guildid');

    // Dad Bot Table
    await createTableIfNotExists('dadbot', '(guildid TEXT PRIMARY KEY, status TEXT)', 'guildid');

    // Announcement Table
    await createTableIfNotExists('announcement', '(msg TEXT)', 'msg');

    // RoleMenu Table
    await createTableIfNotExists('rolemenu', '(guildid TEXT PRIMARY KEY, activeRoleMenuID TEXT, roleList BLOB)', 'guildid');

    // setwelcome table
    await createTableIfNotExists('setwelcome', '(guildid TEXT PRIMARY KEY, channel TEXT, image TEXT)', 'guildid');

    // autorole table
    await createTableIfNotExists('autorole', '(guildid TEXT PRIMARY KEY, role TEXT)', 'guildid');

    // balance table
    await createTableIfNotExists(
      'balance',
      '(id TEXT PRIMARY KEY, user TEXT, guild TEXT, hourly INTEGER, daily INTEGER, weekly INTEGER, monthly INTEGER, stealcool INTEGER, fishcool INTEGER, farmcool INTEGER, boosts BLOB, items BLOB, cash INTEGER, bank INTEGER, total INTEGER, claimNewUser INTEGER, farmPlot BLOB, dmHarvest TEXT, harvestedCrops BLOB, lottery BLOB)',
      'id'
    );
    this.client.getBalance = db.prepare('SELECT * FROM balance WHERE id = ?');
    this.client.setBalance = db.prepare(
      'INSERT OR REPLACE INTO balance (id, user, guild, hourly, daily, weekly, monthly, stealcool, fishcool, farmcool, boosts, items, cash, bank, total, claimNewUser, farmPlot, dmHarvest, harvestedCrops, lottery) VALUES (@id, @user, @guild, @hourly, @daily, @weekly, @monthly, @stealcool, @fishcool, @farmcool, @boosts, @items, @cash, @bank, @total, @claimNewUser, @farmPlot, @dmHarvest, @harvestedCrops, @lottery);'
    );
    this.client.setUserBalance = db.prepare(
      'INSERT OR REPLACE INTO balance (id, user, guild, hourly, daily, weekly, monthly, stealcool, fishcool, farmcool, boosts, items, cash, bank, total, claimNewUser, farmPlot, dmHarvest, harvestedCrops, lottery) VALUES (@id, @user, @guild, @hourly, @daily, @weekly, @monthly, @stealcool, @fishcool, @farmcool, @boosts, @items, @cash, @bank, @total, @claimNewUser, @farmPlot, @dmHarvest, @harvestedCrops, @lottery);'
    );

    // balance config Table
    await createTableIfNotExists('balanceConfig', '(guildid TEXT PRIMARY KEY, status TEXT)', 'guildid');

    // scores table
    await createTableIfNotExists(
      'scores',
      '(id TEXT PRIMARY KEY, user TEXT, guild TEXT, points INTEGER, level INTEGER, country TEXT, image TEXT)',
      'id'
    );
    this.client.getScore = db.prepare('SELECT * FROM scores WHERE user = ? AND guild = ?');
    this.client.setScore = db.prepare(
      'INSERT OR REPLACE INTO scores (id, user, guild, points, level, country) VALUES (@id, @user, @guild, @points, @level, @country);'
    );

    // adsprot table
    await createTableIfNotExists('adsprot', '(guildid TEXT PRIMARY KEY, status TEXT)', 'guildid');

    // anti scam table
    await createTableIfNotExists('antiscam', '(guildid TEXT PRIMARY KEY, status TEXT)', 'guildid');

    // logging table
    await createTableIfNotExists('logging', '(guildid TEXT PRIMARY KEY, channel TEXT)', 'guildid');

    // Ticket Config Table
    await createTableIfNotExists(
      'ticketConfig',
      '(guildid TEXT PRIMARY KEY, category TEXT, log TEXT, role TEXT, ticketembed TEXT, ticketembedchan TEXT, blacklist BLOB)',
      'guildid'
    );

    // Stored Tickets Table
    await createTableIfNotExists('tickets', '(guildid TEXT, ticketid TEXT PRIMARY KEY, authorid TEXT, reason TEXT, chanid TEXT)', 'ticketid');

    // AFK Table
    await createTableIfNotExists('afk', '(id TEXT PRIMARY KEY, guildid TEXT, user TEXT, reason TEXT)', 'id');

    // starboard table
    await createTableIfNotExists('starboard', '(guildid TEXT PRIMARY KEY, channel TEXT)', 'guildid');

    // Starboard
    const grabStarboard = db.prepare('SELECT * FROM starboard').all();

    grabStarboard.forEach((s) => {
      const guild = this.client.guilds.cache.get(s.guildid);
      if (!guild) return;

      const channel = guild.channels.cache.get(s.channel);
      if (!channel) return;

      // Cache messages
      channel.messages.fetch({ limit: 10 });
    });

    // Cooldowns
    const tenSecondTimer = new CronJob(
      '*/10 * * * * *',
      () => {
        // Run every 10 seconds
        // Economy
        // Fetch all balance from db
        const grabBal = db.prepare('SELECT * FROM balance').all();
        // Filter grabBal where farmPlot or harvestedCrops are null
        const grabBalFilter = grabBal.filter((a) => a.farmPlot !== null || a.harvestedCrops !== null);

        // For each grabBalFilter
        grabBalFilter.forEach((a) => {
          let foundPlotList = JSON.parse(a.farmPlot);

          if (!foundPlotList) {
            foundPlotList = [];
          }

          let harvestList = JSON.parse(a.harvestedCrops);

          if (!harvestList) {
            harvestList = [];
          }

          foundPlotList.forEach((key) => {
            // Check if crop is ready to harvest and update db if so
            if (Date.now() > key.cropGrowTime) {
              key.cropStatus = 'harvest';
              key.cropGrowTime = 'na';
              key.decay = 0;

              db.prepare('UPDATE balance SET farmPlot = (@farmPlot) WHERE id = (@id);').run({
                farmPlot: JSON.stringify(foundPlotList),
                id: `${a.user}-${a.guild}`
              });
            }

            // Check if crop is ready to decay and update db if so
            if (key.cropStatus === 'harvest') {
              if (key.decay >= 100) {
                foundPlotList = foundPlotList.filter((c) => c.decay <= 100);

                if (foundPlotList.length <= 0) {
                  db.prepare('UPDATE balance SET farmPlot = (@farmPlot) WHERE id = (@id);').run({
                    farmPlot: null,
                    id: `${a.user}-${a.guild}`
                  });
                  return;
                }

                db.prepare('UPDATE balance SET farmPlot = (@farmPlot) WHERE id = (@id);').run({
                  farmPlot: JSON.stringify(foundPlotList),
                  id: `${a.user}-${a.guild}`
                });
                return;
              }

              key.decay += Number(this.client.ecoPrices.decayRate);

              db.prepare('UPDATE balance SET farmPlot = (@farmPlot) WHERE id = (@id);').run({
                farmPlot: JSON.stringify(foundPlotList),
                id: `${a.user}-${a.guild}`
              });
            }
          });

          // Decay harvested crops over time
          harvestList.forEach((obj) => {
            if (obj.decay >= 100) {
              harvestList = harvestList.filter((c) => c.decay <= 100);
              return;
            }

            obj.decay += Number(this.client.ecoPrices.decayRate);
          });

          if (harvestList.length <= 0) {
            db.prepare('UPDATE balance SET harvestedCrops = (@harvestedCrops) WHERE id = (@id);').run({
              harvestedCrops: null,
              id: `${a.user}-${a.guild}`
            });
            return;
          }

          db.prepare('UPDATE balance SET harvestedCrops = (@harvestedCrops) WHERE id = (@id);').run({
            harvestedCrops: JSON.stringify(harvestList),
            id: `${a.user}-${a.guild}`
          });
        });
      },
      null,
      true
    );

    const twentySecondTimer = new CronJob(
      '*/20 * * * * *',
      () => {
        // Run every 20 seconds
        // Birthdays
        const grabBdays = db.prepare('SELECT * FROM birthdays').all();
        const grabBdaysConfig = db.prepare('SELECT * FROM birthdayConfig').all();

        grabBdaysConfig.forEach((a) => {
          // Check if bot is in the guild
          const guild = this.client.guilds.cache.get(a.guildid);
          if (!guild) {
            db.prepare('DELETE FROM birthdayConfig WHERE guildid = ?').run(a.guildid);
            return;
          }

          const channel = guild.channels.cache.get(a.channel);
          if (!channel) {
            db.prepare('DELETE FROM birthdayConfig WHERE guildid = ?').run(a.guildid);
            return;
          }

          const checkDate = new Date();
          checkDate.setFullYear('2018');
          checkDate.setHours('0');
          checkDate.setMilliseconds('0');
          checkDate.setSeconds('0');
          checkDate.setMinutes('0');

          grabBdays.forEach((b) => {
            // Check if user is in the guild
            const usr = guild.members.cache.get(b.userid);
            if (!usr) return;

            const grabUser = db.prepare(`SELECT * FROM birthdays WHERE userid = ${usr.id};`).get();

            const now = moment();

            let foundLastRun = JSON.parse(grabUser.lastRun);

            if (!foundLastRun) {
              foundLastRun = {};
            }

            const savedDate = new Date(grabUser.birthday);
            savedDate.setFullYear('2018');
            savedDate.setHours('0');
            savedDate.setMilliseconds('0');
            savedDate.setSeconds('0');
            savedDate.setMinutes('0');

            if (checkDate.getTime() === savedDate.getTime()) {
              // Check if the message has already been sent in this guild within the last 24 hours
              if (foundLastRun[guild.id] && now.unix() < foundLastRun[guild.id] + 86400) {
                return;
              }

              let msg;

              const role = guild.roles.cache.get(a.role);

              if (role) {
                msg = `It's ${usr}'s birthday! ${role} Say Happy Birthday! 🍰`;
              } else {
                msg = `It's ${usr}'s birthday! Say Happy Birthday! 🍰`;
              }
              channel.send(msg);

              // Update the lastRun property with the current timestamp
              foundLastRun[guild.id] = now.unix();
              db.prepare('UPDATE birthdays SET lastRun = (@lastRun);').run({
                lastRun: JSON.stringify(foundLastRun)
              });
            }
          });
        });
      },
      null,
      true
    );

    const twoMinuteTimer = new CronJob(
      '*/30 * * * * *',
      () => {
        // Run every 2 minutes
        // Bans
        const grabBans = db.prepare('SELECT * FROM ban').all();
        grabBans.forEach((r) => {
          this.client.guilds.fetch(r.guildid).then((guild) => {
            if (!guild) return;

            guild.bans.fetch().then((bans) => {
              const userCheck = bans.filter((ban) => ban.user.id === r.userid);
              if (!userCheck.first()) {
                db.prepare('DELETE FROM ban WHERE id = ?').run(`${guild.id}-${r.userid}`);
              }
            });

            if (Date.now() > r.endtime) {
              const embed = new EmbedBuilder()
                .setThumbnail(this.client.user.displayAvatarURL())
                .setColor(this.client.utils.color(guild.members.me.displayHexColor))
                .addFields({
                  name: 'Action | Un-Ban',
                  value: `**◎ User:** ${r.username}
							**◎ Reason:** Ban time ended.`
                })
                .setTimestamp();

              try {
                guild.members.unban(r.userid, 'tempban');

                // const channelGrab = db.prepare('SELECT channel FROM ban WHERE id = ?').get(`${guild.id}-${r.userid}`);
                // const findChannel = this.client.channels.cache.get(channelGrab.channel);

                // findChannel.send({ embeds: [embed] });

                db.prepare('DELETE FROM ban WHERE id = ?').run(`${guild.id}-${r.userid}`);
              } catch {
                db.prepare('DELETE FROM ban WHERE id = ?').run(`${guild.id}-${r.userid}`);
                return;
              }

              const dbid = db.prepare(`SELECT channel FROM logging WHERE guildid = ${guild.id};`).get();
              const dblogs = dbid.channel;
              const chnCheck = this.client.channels.cache.get(dblogs);
              if (!chnCheck) {
                db.prepare('DELETE FROM logging WHERE guildid = ?').run(guild.id);
              }

              if (dbid) {
                this.client.channels.cache.get(dblogs).send({ embeds: [embed] });
              }
            }
          });
        });
      },
      null,
      true
    );

    const twentyFourTimer = new CronJob(
      '0 13 * * *',
      async () => {
        // Run every 24 hours
        const guild = this.client.guilds.cache.get('657235952116170794');
        if (!guild) return;
        const chn = guild.channels.cache.get('663193215943311373');
        if (!chn) return;

        try {
          const url = 'https://www.merriam-webster.com/word-of-the-day';
          const response = await fetch(url);

          if (response.ok) {
            const arr = [];

            const body = await response.text();
            const $ = load(body);

            // Word
            const wordClass = $('.word-and-pronunciation');
            const word = wordClass.find('h1').text();

            // Word Attributes
            const typeFetch = $('.main-attr');
            const type = typeFetch.text();
            const syllablesFetch = $('.word-syllables');
            const syllables = syllablesFetch.text();

            // Definiton
            const wordDef = $('.wod-definition-container');
            if (wordDef) {
              const def = wordDef.html();
              try {
                const wordDefSplit1 = def.substring(def.indexOf('<p>') + 3);
                const wordDefSplit2 = wordDefSplit1.split('</p>')[0];
                arr.push({ name: '**Definition:**', value: `>>> *${replEm(wordDefSplit2)}*` });
              } catch {
                // Do nothing (:
              }
            }

            // Example
            const wordEx = $('.wod-definition-container p:eq(1)');
            if (wordEx) {
              const def = wordEx.html();
              try {
                arr.push({ name: '**Example:**', value: `>>> ${replEm(def).substring(3)}` });
              } catch {
                // Do nothing lmao because why the fuck not (:
              }
            }

            // Embed
            const embed = new EmbedBuilder()
              .setColor(this.client.utils.color(guild.members.me.displayHexColor))
              .setAuthor({
                name: 'Word of the Day',
                url: 'https://www.merriam-webster.com/word-of-the-day',
                iconURL: guild.iconURL({ extension: 'png' })
              })
              .setDescription(`>>> **${this.client.utils.capitalise(word)}**\n*[ ${syllables} ]*\n*${type}*`)
              .addFields(...arr);
            chn.send({ embeds: [embed] });
          }
        } catch (error) {
          console.log(error);
        }
      },
      null,
      true
    );

    // Run cron jobs
    tenSecondTimer.start();
    twentySecondTimer.start();
    twoMinuteTimer.start();
    twentyFourTimer.start();

    function replEm(str) {
      const re1 = /<a href=".*?</g;
      const re2 = /<em>/g;
      const re3 = /<\/em>/g;
      const re4 = /<\/a>/g;
      const re5 = /em>/g;
      return str.replaceAll(re1, '').replace(re2, '**').replace(re3, '**').replace(re4, '').replace(re5, '**');
    }
  }
};

export default EventF;
