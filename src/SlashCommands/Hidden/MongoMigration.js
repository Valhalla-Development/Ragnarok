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
        I wanted to give you all a quick heads up that I will be migrating our database over the next 20 minutes. While I don't anticipate any downtime, please be aware that any data input to the current database from this moment on will be rolled back once the migration is complete.
        
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

    const logProgress = async (name, item, i) => {
      if (item.length > 1) {
        console.log(`${name} ${i.toLocaleString('en')}/${item.length.toLocaleString('en')}`);
      }
    };

    try {
      const startTime = new Date();

      await (async () => {
        if (adsprot.length) {
          let i = 0;
          for (const entry of adsprot) {
            await new AdsProtection({
              GuildId: entry.guildid,
              Status: entry.status === 'on'
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('Ads Protection', adsprot, i, i);
          }
          console.log(`Ads Protection Finished Migrating ${adsprot.length.toLocaleString('en')} properties!`);
        }

         if (afk.length) {
          let i = 0;
          for (const entry of afk) {
            await new AFK({
              IdJoined: entry.id,
              GuildId: entry.guildid,
              UserId: entry.user,
              Reason: entry.reason
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('AFK', afk, i, i);
          }
          console.log(`AFK Finished Migrating ${adsprot.length.toLocaleString('en')} properties!`);
        }

        if (announcement.length) {
          let i = 0;
          for (const entry of announcement) {
            await new Announcement({
              Message: entry.msg
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('Announcement', announcement, i);
          }
          console.log(`Announcement Finished Migrating ${announcement.length.toLocaleString('en')} properties!`);
        }

        if (antiscam.length) {
          let i = 0;
          for (const entry of antiscam) {
            await new AntiScam({
              GuildId: entry.guildid,
              Status: entry.status === 'on'
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('AntiScam', antiscam, i);
          }
          console.log(`AntiScam Finished Migrating ${antiscam.length.toLocaleString('en')} properties!`);
        }

        if (autorole.length) {
          let i = 0;
          for (const entry of autorole) {
            await new AutoRole({
              GuildId: entry.guildid,
              Role: entry.role
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('Autorole', autorole, i);
          }
          console.log(`Autorole Finished Migrating ${autorole.length.toLocaleString('en')} properties!`);
        }

        if (balance.length) {
          let i = 0;
          for (const entry of balance) {
            await new Balance({
              IdJoined: entry.id,
              UserId: entry.user,
              GuildId: entry.guild,
              Hourly: entry.hourly,
              Daily: entry.daily,
              Weekly: entry.weekly,
              Monthly: entry.monthly,
              StealCool: entry.stealcool,
              FishCool: entry.fishcool,
              FarmCool: entry.farmcool,
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
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('Balance', balance, i);
          }
          console.log(`Balance Finished Migrating ${balance.length.toLocaleString('en')} properties!`);
        }

        if (ban.length) {
          let i = 0;
          for (const entry of ban) {
            let newId = null;
            if (entry.id) {
              const parts = entry.id.split('-'); // split the string by '-'
              newId = `${parts[1]}-${parts[0]}`; // swap the parts
            }

            await new TempBan({
              IdJoined: newId,
              GuildId: entry.guildid,
              UserId: entry.userid,
              EndTime: entry.endtime,
              ChannelId: entry.channel,
              Username: entry.username
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('Ban', ban, i);
          }
          console.log(`Ban Finished Migrating ${ban.length.toLocaleString('en')} properties!`);
        }

         if (birthdayConfig.length) {
          let i = 0;
          for (const entry of birthdayConfig) {
            await new BirthdayConfig({
              GuildId: entry.guildid,
              ChannelId: entry.channel,
              Role: entry.role
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('Birthday Config', birthdayConfig, i);
          }
          console.log(`Birthday Config Finished Migrating ${birthdayConfig.length.toLocaleString('en')} properties!`);
        }

        if (birthdays.length) {
          let i = 0;
          for (const entry of birthdays) {
            await new Birthdays({
              UserId: entry.userid,
              Date: entry.birthday,
              LastRun: JSON.parse(entry.lastRun)
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('Birthdays', birthdays, i);
          }
          console.log(`Birthdays Finished Migrating ${birthdays.length.toLocaleString('en')} properties!`);
        }

        if (dadbot.length) {
          let i = 0;
          for (const entry of dadbot) {
            await new Dad({
              GuildId: entry.guildid,
              Status: entry.status === 'on'
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('Dad', dadbot, i);
          }
          console.log(`Dad Finished Migrating ${dadbot.length.toLocaleString('en')} properties!`);
        }

        if (hastebin.length) {
          let i = 0;
          for (const entry of hastebin) {
            await new Hastebin({
              GuildId: entry.guildid,
              Status: entry.status === 'on'
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('Hastebin', hastebin, i);
          }
          console.log(`Hastebin Finished Migrating ${hastebin.length.toLocaleString('en')} properties!`);
        }

        if (level.length) {
          let i = 0;
          for (const entry of level) {
            await new LevelConfig({
              GuildId: entry.guildid,
              Status: entry.status === 'killME'
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('Autorole', autorole, i);
          }
          console.log(`Autorole Finished Migrating ${autorole.length.toLocaleString('en')} properties!`);
        }

        if (logging.length) {
          let i = 0;
          for (const entry of logging) {
            await new Logging({
              GuildId: entry.guildid,
              ChannelId: entry.channel
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('Logging', logging, i);
          }
          console.log(`Logging Finished Migrating ${logging.length.toLocaleString('en')} properties!`);
        }

        if (rolemenu.length) {
          let i = 0;
          for (const entry of rolemenu) {
            const activeRoleMenuID = JSON.parse(entry.activeRoleMenuID);
            await new RoleMenu({
              GuildId: entry.guildid,
              RoleMenuId: {
                channel: activeRoleMenuID?.channel,
                message: activeRoleMenuID?.message
              },
              RoleList: JSON.parse(entry.roleList)
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('Rolemenu', rolemenu, i);
          }
          console.log(`Rolemenu Finished Migrating ${rolemenu.length.toLocaleString('en')} properties!`);
        }

        if (scores.length) {
          let i = 0;
          for (const entry of scores) {
            let newId = null;
            if (entry.id) {
              const parts = entry.id.split('-'); // split the string by '-'
              newId = `${parts[1]}-${parts[0]}`; // swap the parts
            }

            await new Level({
              IdJoined: newId,
              UserId: entry.user,
              GuildId: entry.guild,
              Xp: entry.points,
              Level: entry.level,
              Country: entry.country,
              Image: entry.image
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('Scores', scores, i);
          }
          console.log(`Scores Finished Migrating ${scores.length.toLocaleString('en')} properties!`);
        }

         if (setwelcome.length) {
          let i = 0;
          for (const entry of setwelcome) {
            await new Welcome({
              GuildId: entry.guildid,
              ChannelId: entry.channel,
              Image: entry.image
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('SetWelcome', setwelcome, i);
          }
          console.log(`SetWelcome Finished Migrating ${setwelcome.length.toLocaleString('en')} properties!`);
        }

        if (starboard.length) {
          let i = 0;
          for (const entry of starboard) {
            await new StarBoard({
              GuildId: entry.guildid,
              ChannelId: entry.channel
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('Starboard', starboard, i);
          }
          console.log(`Starboard Finished Migrating ${starboard.length.toLocaleString('en')} properties!`);
        }

        if (ticketConfig.length) {
          let i = 0;
          for (const entry of ticketConfig) {
            await new TicketConfig({
              GuildId: entry.guildid,
              Category: entry.category,
              LogChannel: entry.log,
              Role: entry.role,
              Embed: entry.ticketembed,
              EmbedChannel: entry.ticketembedchan,
              Blacklist: JSON.parse(entry.blacklist)
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('TicketConfig', ticketConfig, i);
          }
          console.log(`TicketConfig Finished Migrating ${ticketConfig.length.toLocaleString('en')} properties!`);
        }

        if (tickets.length) {
          let i = 0;
          for (const entry of tickets) {
            await new Tickets({
              GuildId: entry.guildid,
              TicketId: entry.ticketid,
              AuthorId: entry.authorid,
              Reason: entry.reason,
              ChannelId: entry.chanid
            })
              .save()
              .catch(console.error);
            i++;
            await logProgress('Tickets', tickets, i);
          }
          console.log(`Tickets Finished Migrating ${tickets.length.toLocaleString('en')} properties!`);
        }

        const guildsArray = Array.from(this.client.guilds.cache.values());
        let i = 0;
        for (const guild of guildsArray) {// todo test
          await new Guilds({
            GuildId: guild.id,
            Name: guild.name,
            IconUrl: guild.iconURL()
          })
              .save()
              .catch(console.error);
          i++;
          await logProgress('Guilds', this.client.guilds.cache.size, i);
        }
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
