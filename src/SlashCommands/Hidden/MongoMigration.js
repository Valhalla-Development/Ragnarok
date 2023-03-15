/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
import SQLite from 'better-sqlite3';
import SlashCommand from '../../Structures/SlashCommand.js';
import AdsProtection from '../../Mongo/Schemas/AdsProtection.js';
import AFK from '../../Mongo/Schemas/AFK.js';
import Announcement from '../../Mongo/Schemas/Announcement.js';
import AntiScam from '../../Mongo/Schemas/AntiScam.js';
import AutoRole from '../../Mongo/Schemas/AutoRole.js';
import Balance from '../../Mongo/Schemas/Balance.js';
import BirthdayConfig from '../../Mongo/Schemas/BirthdayConfig.js';
import Birthdays from '../../Mongo/Schemas/Birthdays.js';
import Dad from '../../Mongo/Schemas/Dad.js';
import Hastebin from '../../Mongo/Schemas/Hastebin.js';
import Level from '../../Mongo/Schemas/Level.js';
import LevelConfig from '../../Mongo/Schemas/LevelConfig.js';
import Logging from '../../Mongo/Schemas/Logging.js';
import RoleMenu from '../../Mongo/Schemas/RoleMenu.js';
import StarBoard from '../../Mongo/Schemas/StarBoard.js';
import TempBan from '../../Mongo/Schemas/TempBan.js';
import TicketConfig from '../../Mongo/Schemas/TicketConfig.js';
import Tickets from '../../Mongo/Schemas/Tickets.js';
import Welcome from '../../Mongo/Schemas/Welcome.js';
import Guilds from '../../Mongo/Schemas/Guilds.js';

export const SlashCommandF = class extends SlashCommand {
  constructor(...args) {
    super(...args, {
      description: 'Migrate from better-sqlite3 to mongoose',
      category: 'Hidden',
      ownerOnly: true
    });
  }

  async run() {
    /*
     * Steps to migrate, mark when done!

     * 1: Create schemas for mongoose ✓
     * 2: Migrate ANY and ALL code that refers to better-sqlite3 database (hint: I think it's findOneAndUpdate) ✓
     * 3: Run the migration script to a database called 'Ragnarok' - DON'T FORGET TO CHANGE .ENV TO 'Ragnarok'
     * 4: Test that every call to mongoose works as expected! IMPORTANT!
     * 5: Add a test command to VPS, to ensure it can reach mongo, you may need to add the VPS IP to mongo ✓
     * 6: Everything is now ready for production, so follow these:
        * 6a: BACKUP EVERYTHING, leave database file as it will be easier to switch back.
        * 6b: Disable the economy and level creation functions on messageCreate and interactionCreate
        * 6c: Return on messageCreate and interactionCreate, except for this script to prevent issues
        * 6d: Use migration script
        * 6e: Make announcement, use ChatGPT to make it sound smart... Don't forget to say how long downtime is, migration script tells you at the bottom
        * 6eA:
        Greetings, Ragnarok users!
        I wanted to give you all a quick heads up that I will be migrating our database over the next couple of minutes. While I don't anticipate any downtime, please be aware that any data input to the current database from this moment on will be rolled back once the migration is complete.
        
        Rest assured, once the migration is finished, everything will be back to normal and your data will be safe and secure in our new database. Thank you for your patience and understanding during this process. If you have any questions or concerns, please don't hesitate to reach out to me.
        
        Best, Ragnar

        || @everyone :pepesad: ||

        * 6f: Stop Ragnarok
        * 6g: Move new files
        * 6h: Start Ragnarok
        * 6i: Make a sacrifice to the Gods so everything works without issue
        * 6j: Make announcement with ChatGPT again, ask to report any issues!
        * 6kA:
        Just a quick update to let you know that the database migration is complete. Thank you for your patience during the process. As always, if you encounter any issues, please let me know.
     */

    const db = new SQLite('./Storage/DB/db.sqlite');

    const adsprot = await db.prepare('SELECT * FROM adsprot').all();
    const afk = await db.prepare('SELECT * FROM afk').all();
    const announcement = await db.prepare('SELECT * FROM announcement').all();
    const antiscam = await db.prepare('SELECT * FROM antiscam').all();
    const autorole = await db.prepare('SELECT * FROM autorole').all();
    const balance = await db.prepare('SELECT * FROM balance').all();
    const ban = await db.prepare('SELECT * FROM ban').all();
    const birthdayConfig = await db.prepare('SELECT * FROM birthdayConfig').all();
    const birthdays = await db.prepare('SELECT * FROM birthdays').all();
    const dadbot = await db.prepare('SELECT * FROM dadbot').all();
    const hastebin = await db.prepare('SELECT * FROM hastebin').all();
    const level = await db.prepare('SELECT * FROM level').all();
    const logging = await db.prepare('SELECT * FROM logging').all();
    const rolemenu = await db.prepare('SELECT * FROM rolemenu').all();
    const scores = await db.prepare('SELECT * FROM scores').all();
    const setwelcome = await db.prepare('SELECT * FROM setwelcome').all();
    const starboard = await db.prepare('SELECT * FROM starboard').all();
    const ticketConfig = await db.prepare('SELECT * FROM ticketConfig').all();
    const tickets = await db.prepare('SELECT * FROM tickets').all();

    const totalLength =
      adsprot.length +
      afk.length +
      announcement.length +
      antiscam.length +
      autorole.length +
      balance.length +
      ban.length +
      birthdayConfig.length +
      birthdays.length +
      dadbot.length +
      hastebin.length +
      level.length +
      logging.length +
      rolemenu.length +
      scores.length +
      setwelcome.length +
      starboard.length +
      ticketConfig.length +
      tickets.length;

    try {
      const startTime = new Date();

      await (async () => {
        if (adsprot.length) {
          const bulkOps = adsprot.map(entry => ({
            insertOne: {
              document: {
                GuildId: entry.guildid,
                Status: entry.status === 'on'
              }
            }
          }));

          await AdsProtection.bulkWrite(bulkOps);

          console.log(`Ads Protection Finished Migrating ${adsprot.length.toLocaleString('en')} properties!`);
        }

        if (afk.length) {
          const bulkOps = afk.map(entry => ({
            insertOne: {
              document: {
                IdJoined: entry.id,
                GuildId: entry.guildid,
                UserId: entry.user,
                Reason: entry.reason
              }
            }
          }));

          await AFK.bulkWrite(bulkOps);

          console.log(`AFK Finished Migrating ${afk.length.toLocaleString('en')} properties!`);
        }

        if (announcement.length) {
          const bulkOps = announcement.map(entry => ({
            insertOne: {
              document: {
                Message: entry.msg
              }
            }
          }));

          await Announcement.bulkWrite(bulkOps);

          console.log(`Announcement Finished Migrating ${announcement.length.toLocaleString('en')} properties!`);
        }

        if (antiscam.length) {
          const bulkOps = antiscam.map(entry => ({
            insertOne: {
              document: {
                GuildId: entry.guildid,
                Status: entry.status === 'on'
              }
            }
          }));

          await AntiScam.bulkWrite(bulkOps);

          console.log(`AntiScam Finished Migrating ${antiscam.length.toLocaleString('en')} properties!`);
        }

        if (autorole.length) {
          const bulkOps = autorole.map(entry => ({
            insertOne: {
              document: {
                GuildId: entry.guildid,
                Role: entry.role
              }
            }
          }));

          await AutoRole.bulkWrite(bulkOps);

          console.log(`AutoRole Finished Migrating ${autorole.length.toLocaleString('en')} properties!`);
        }

        if (balance.length) {
          const bulkOps = balance.map(entry => ({
            insertOne: {
              document: {
                IdJoined: entry.id,
                UserId: entry.user,
                GuildId: entry.guild,
                Hourly: entry.hourly,
                Daily: entry.daily,
                Weekly: entry.weekly,
                Monthly: entry.monthly,
                StealCool: entry.stealcool,
                FishCool: entry.fishcool,
                FarmCool: entry.farmcool,// todo need to update all these to the new object based
                Boosts: entry.boosts,
                Items: entry.items,
                Cash: entry.cash,
                Bank: entry.bank,
                Total: entry.total,
                ClaimNewUser: entry.claimNewUser,
                FarmPlot: entry.farmPlot,
                DmHarvest: entry.dmHarvest,
                HarvestedCrops: entry.harvestedCrops,
                Lottery: entry.lottery
              }
            }
          }));

          await Balance.bulkWrite(bulkOps);

          console.log(`Balance Finished Migrating ${balance.length.toLocaleString('en')} properties!`);
        }

        if (ban.length) {
          const bulkOps = ban.map(entry => {
            let newId = entry.IdJoined;
            if (entry.id) {
              const parts = entry.id.split('-');// todo test
              newId = `${parts[1]}-${parts[0]}`;
            }
            return {
              insertOne: {
                document: {
                  IdJoined: newId,
                  GuildId: entry.guildid,
                  UserId: entry.userid,
                  EndTime: entry.endtime,
                  ChannelId: entry.channel,
                  Username: entry.username
                }
              }
            };
          });

          await TempBan.bulkWrite(bulkOps);

          console.log(`Ban Finished Migrating ${ban.length.toLocaleString('en')} properties!`);
        }

        if (birthdayConfig.length) {
          const bulkOps = birthdayConfig.map(entry => ({
            insertOne: {
              document: {
                GuildId: entry.guildid,
                ChannelId: entry.channel,
                Role: entry.role
              }
            }
          }));

          await BirthdayConfig.bulkWrite(bulkOps);

          console.log(`BirthdayConfig Finished Migrating ${birthdayConfig.length.toLocaleString('en')} properties!`);
        }

        if (birthdays.length) {
          const bulkOps = birthdays.map(entry => ({
            insertOne: {
              document: {
                UserId: entry.userid,
                Date: entry.birthday,
                LastRun: JSON.parse(entry.lastRun)
              }
            }
          }));

          await Birthdays.bulkWrite(bulkOps);

          console.log(`Birthdays Finished Migrating ${birthdays.length.toLocaleString('en')} properties!`);
        }

        if (dadbot.length) {
          const bulkOps = dadbot.map(entry => ({
            insertOne: {
              document: {
                GuildId: entry.guildid,
                Status: entry.status === 'on'
              }
            }
          }));

          await Dad.bulkWrite(bulkOps);

          console.log(`Dad Finished Migrating ${dadbot.length.toLocaleString('en')} properties!`);
        }

        if (hastebin.length) {
          const bulkOps = hastebin.map(entry => ({
            insertOne: {
              document: {
                GuildId: entry.guildid,
                Status: entry.status === 'on'
              }
            }
          }));

          await Hastebin.bulkWrite(bulkOps);

          console.log(`Haste Finished Migrating ${hastebin.length.toLocaleString('en')} properties!`);
        }

        if (level.length) {
          const bulkOps = level.map(entry => ({
            insertOne: {
              document: {
                GuildId: entry.guildid,
                Status: entry.status === 'killME'
              }
            }
          }));

          await LevelConfig.bulkWrite(bulkOps);

          console.log(`Level Finished Migrating ${level.length.toLocaleString('en')} properties!`);
        }

        if (logging.length) {
          const bulkOps = logging.map(entry => ({
            insertOne: {
              document: {
                GuildId: entry.guildid,
                ChannelId: entry.channel
              }
            }
          }));

          await Logging.bulkWrite(bulkOps);

          console.log(`Logging Finished Migrating ${logging.length.toLocaleString('en')} properties!`);
        }

        if (rolemenu.length) {
          const bulkOps = rolemenu.map(entry => {
            const activeRoleMenuID = JSON.parse(entry.activeRoleMenuID);
            return {
              insertOne: {
                document: {
                  GuildId: entry.guildid,
                  RoleMenuId: {
                    channel: activeRoleMenuID?.channel,
                    message: activeRoleMenuID?.message
                  },
                  RoleList: JSON.parse(entry.roleList)
                }
              }
            };
          });

          await RoleMenu.bulkWrite(bulkOps);

          console.log(`RoleMenu Finished Migrating ${rolemenu.length.toLocaleString('en')} properties!`);
        }

        if (scores.length) {
          const bulkOps = scores.map(entry => {
            let newId = entry.IdJoined;
            if (entry.id) {
              const parts = entry.id.split('-');// todo test
              newId = `${parts[1]}-${parts[0]}`;
            }
            return {
              insertOne: {
                document: {
                  IdJoined: newId,
                  UserId: entry.user,
                  GuildId: entry.guild,
                  Xp: entry.points,
                  Level: entry.level,
                  Country: entry.country,
                  Image: entry.image
                }
              }
            };
          });

          await Level.bulkWrite(bulkOps);

          console.log(`Scores Finished Migrating ${scores.length.toLocaleString('en')} properties!`);
        }

        if (setwelcome.length) {
          const bulkOps = setwelcome.map(entry => ({
            insertOne: {
              document: {
                GuildId: entry.guildid,
                ChannelId: entry.channel,
                Image: entry.image
              }
            }
          }));

          await Welcome.bulkWrite(bulkOps);

          console.log(`SetWelcome Finished Migrating ${setwelcome.length.toLocaleString('en')} properties!`);
        }

        if (starboard.length) {
          const bulkOps = starboard.map(entry => ({
            insertOne: {
              document: {
                GuildId: entry.guildid,
                ChannelId: entry.channel
              }
            }
          }));

          await StarBoard.bulkWrite(bulkOps);

          console.log(`StarBoard Finished Migrating ${starboard.length.toLocaleString('en')} properties!`);
        }

        if (ticketConfig.length) {
          const bulkOps = ticketConfig.map(entry => ({
            insertOne: {
              document: {
                GuildId: entry.guildid,
                Category: entry.category,
                LogChannel: entry.log,
                Role: entry.role,
                Embed: entry.ticketembed,
                EmbedChannel: entry.ticketembedchan,
                Blacklist: JSON.parse(entry.blacklist)
              }
            }
          }));

          await TicketConfig.bulkWrite(bulkOps);

          console.log(`TicketConfig Finished Migrating ${ticketConfig.length.toLocaleString('en')} properties!`);
        }

        if (tickets.length) {
          const bulkOps = tickets.map(entry => ({
            insertOne: {
              document: {
                GuildId: entry.guildid,
                TicketId: entry.ticketid,
                AuthorId: entry.authorid,
                Reason: entry.reason,
                ChannelId: entry.chanid
              }
            }
          }));

          await Tickets.bulkWrite(bulkOps);

          console.log(`Tickets Finished Migrating ${tickets.length.toLocaleString('en')} properties!`);
        }

        const guildsArray = Array.from(this.client.guilds.cache.values());
        const bulkOps = guildsArray.map(guild => ({
          insertOne: {
            document: {
              GuildId: guild.id,
              Name: guild.name,
              IconUrl: guild.iconURL()
            }
          }
        }));

        await Guilds.bulkWrite(bulkOps);

        console.log(`Guilds Finished Migrating ${this.client.guilds.cache.size.toLocaleString('en')} properties!`);

        const endTime = new Date();
        const timeDifference = endTime - startTime;

        const minutes = Math.floor(timeDifference / 60000);
        const seconds = Math.floor((timeDifference % 60000) / 1000);

        console.log(
          `\n\n[DB Migration] Completed ${totalLength.toLocaleString('en')} properties!\nTime taken: ${minutes} minutes ${seconds} seconds\n\n`
        );
      })();
    } catch (e) {
      console.log(e);
    }
  }
};

export default SlashCommandF;
