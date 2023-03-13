/* eslint-disable no-param-reassign */
import { ActivityType, EmbedBuilder } from 'discord.js';
import moment from 'moment';
import { CronJob } from 'cron';
import fetch from 'node-fetch';
import { load } from 'cheerio';
import Table from 'cli-table3';
import si from 'systeminformation';
import Event from '../../Structures/Event.js';
import StarBoard from '../../Mongo/Schemas/StarBoard.js';
import Balance from '../../Mongo/Schemas/Balance.js';
import Birthdays from '../../Mongo/Schemas/Birthdays.js';
import BirthdayConfig from '../../Mongo/Schemas/BirthdayConfig.js';
import TempBan from '../../Mongo/Schemas/TempBan.js';
import Logging from '../../Mongo/Schemas/Logging.js';
import * as packageFile from '../../../package.json' assert { type: 'json' };

const pckg = packageFile.default;

export const EventF = class extends Event {
  constructor(...args) {
    super(...args, {
      once: true
    });
  }

  async run() {
    const red = '\x1b[31m';
    const magenta = '\x1b[35m';
    const white = '\x1b[37m';
    const green = '\x1b[32m';
    const yellow = '\x1b[33m';
    const blue = '\x1b[34m';
    const underline = '\x1b[4m';
    const bold = '\x1b[1m';
    const reset = '\x1b[0m';

    console.log(`\n——————————[${this.client.user.username} Guilds]——————————`.replace(/(^\n.*$)/g, `${red + bold}$1${reset}`));
    // Bot Guilds
    const table = new Table({
      head: ['Count', 'Name', 'ID']
    });

    let count = 1;
    this.client.guilds.cache.forEach((guild) => {
      table.push([count, guild.name, guild.id]);
      count++;
    });

    console.log(table.toString());

    // Bot Info
    console.log(`\n——————————[${this.client.user.username} Info]——————————`.replace(/(^\n.*$)/g, `${red + bold}$1${reset}`));
    console.log(
      `Users: ${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')}`
        .replace(/(Users: )/, `${white + bold}$1${yellow}`)
        .concat(reset)
    );
    console.log(`Guilds: ${this.client.guilds.cache.size.toLocaleString('en')}`.replace(/(Guilds: )/, `${white + bold}$1${yellow}`).concat(reset));
    console.log(`Slash Commands: ${this.client.slashCommands.size}`.replace(/(Slash Commands: )/, `${white + bold}$1${yellow}`).concat(reset));
    console.log(`Events: ${this.client.events.size}`.replace(/(Events: )/, `${white + bold}$1${yellow}`).concat(reset));
    console.log(
      `Invite: https://discordapp.com/oauth2/authorize?client_id=${this.client.user.id}&scope=bot%20applications.commands&permissions=415306870006`
        .replace(/(Invite: )/, `${white + bold}$1${blue}${underline}`)
        .concat(reset)
    );

    // Bot Specs
    console.log(`\n——————————[${this.client.user.username} Specs]——————————`.replace(/(^\n.*$)/g, `${red + bold}$1${reset}`));
    console.log(
      `Running Node: ${process.version} on ${process.platform} ${process.arch}`
        .replace(/(Running Node: )/, `${white + bold}$1${magenta}${bold}`)
        .replace(/( on )/, `${white + bold}$1${magenta}${bold}`)
        .concat(reset)
    );

    const memory = await si.mem();
    const totalMemory = Math.floor(memory.total / 1024 / 1024);
    const cachedMem = memory.buffcache / 1024 / 1024;
    const memoryUsed = memory.used / 1024 / 1024;
    const realMemUsed = Math.floor(memoryUsed - cachedMem);

    console.log(
      `Memory: ${realMemUsed.toLocaleString('en')} / ${totalMemory.toLocaleString('en')} MB`
        .replace(/(Memory: )/, `${white + bold}$1${yellow}${bold}`)
        .replace(/( \/ )/, `${white + bold}$1${yellow}${bold}`)
        .replace(/(MB)/, `${white + bold}$1`)
        .concat(reset)
    );
    console.log(
      `Discord.js Verion: ${pckg.dependencies['discord.js'].substring(1)}`
        .replace(/(Discord.js Verion: )/, `${white + bold}$1${green}${bold}`)
        .concat(reset)
    );
    console.log(
      `${this.client.user.username} Version: ${pckg.dependencies['discord.js'].substring(1)}\n`
        .replace(/(^.*)/, `${white + bold}$1${reset}`)
        .replace(/(: )/, `${white + bold}$1${magenta}${bold}`)
        .concat(reset)
    );

    this.client.user.setActivity(
      `/help |
  ${this.client.guilds.cache.size.toLocaleString('en')} Guilds
  ${this.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')} Users`,
      {
        type: ActivityType.Watching
      }
    );

    // Starboard
    const grabStarboard = await StarBoard.find();

    grabStarboard.forEach((s) => {
      const guild = this.client.guilds.cache.get(s.GuildId);
      if (!guild) return;

      const channel = guild.channels.cache.get(s.ChannelId);
      if (!channel) return;

      // Cache messages
      channel.messages.fetch({ limit: 10 });
    });

    // Cooldowns
    // Define a function to update the farms for a given user
    async function updateFarms(IdJoined, db) {
      // Fetch the FarmPlot and HarvestedCrops columns for the users
      const userData = db.filter((balance) => IdJoined.includes(balance.IdJoined));

      // Use the moment library to create moment objects for the current time and the cropGrowTime
      const currentTime = moment();

      return userData.map((data) => {
        // Parse the JSON strings into arrays
        const FarmPlot = data.FarmPlot ? JSON.parse(data.FarmPlot) : [];
        const HarvestedCrops = data.HarvestedCrops ? JSON.parse(data.HarvestedCrops) : [];

        // Use the map method to transform the FarmPlot array into a new array with updated values
        const updatedFarmPlot = FarmPlot.map((plot) => {
          // Check if the crop is ready to harvest
          const plotGrowTime = moment.unix(plot.cropGrowTime / 1000);
          if (currentTime.diff(plotGrowTime) >= 0) {
            plot.cropStatus = 'harvest';
            plot.cropGrowTime = 'na';
            plot.decay = 0;
          }

          // Check if the crop is ready to decay
          if (plot.cropStatus === 'harvest') {
            if (plot.decay >= 100) {
              // If the decay is at 100, remove the plot from the array
              return null;
            }

            // Increase the decay by the decay rate
            plot.decay += client.ecoPrices.decayRate;
          }

          // Return the updated plot object
          return plot;
        });

        // Filter out any null values from the updatedFarmPlot array
        const cleanedFarmPlot = updatedFarmPlot.filter(Boolean);

        // Use the map method to transform the HarvestedCrops array into a new array with updated values
        const updatedHarvestedCrops = HarvestedCrops.map((crop) => {
          if (crop.decay >= 100) {
            // If the decay is at 100, remove the crop from the array
            return null;
          }

          // Increase the decay by the decay rate
          crop.decay += client.ecoPrices.decayRate * 6;

          // Return the updated crop object
          return crop;
        });

        // Filter out any null values from the updatedHarvestedCrops array
        const cleanedHarvestedCrops = updatedHarvestedCrops.filter(Boolean);

        return {
          filter: { IdJoined: data.IdJoined },
          update: {
            $set: {
              FarmPlot: JSON.stringify(cleanedFarmPlot),
              HarvestedCrops: JSON.stringify(cleanedHarvestedCrops)
            }
          }
        };
      });
    }

    // Use a CronJob to run the updateAllFarms function every minute
    const oneMinTimer = new CronJob(
      '0 * * * * *',
      async () => {
        // Fetch all balance records from the database
        const balances = await Balance.find(); // TODO test BIG TIME
        // Use the map method to transform the balances array into an array of IdJoined, which is user id and guild id
        const IdJoined = [...new Set(balances.map((balance) => balance.IdJoined))];
        const updates = updateFarms(IdJoined, balances, this.client);
        await Balance.updateMany(updates);
      },
      null,
      true
    );

    const oneDayTimer = new CronJob(
      '0 0 0 * * *',
      async () => {
        // Run every day
        // Birthdays
        const grabBdays = await Birthdays.find();
        const grabBdaysConfig = await BirthdayConfig.find();
        const findUserBday = async (id) => {
          return Birthdays.findOne({ UserId: id }); // TODO TEST
        };

        await Promise.all(
          grabBdaysConfig.map(async (a) => {
            // Check if bot is in the guild
            const guild = this.client.guilds.cache.get(a.GuildId);
            if (!guild) {
              await BirthdayConfig.deleteMany({ GuildId: a.GuildId });
              return;
            }

            const channel = guild.channels.cache.get(a.ChannelId);
            if (!channel) {
              await BirthdayConfig.deleteMany({ GuildId: a.GuildId });
              return;
            }

            const checkDate = new Date();
            checkDate.setHours('0');
            checkDate.setMilliseconds('0');
            checkDate.setSeconds('0');
            checkDate.setMinutes('0');

            await Promise.all(
              grabBdays.map(async (b) => {
                // Check if user is in the guild
                const usr = guild.members.cache.get(b.UserId);
                if (!usr) return;

                const grabUser = findUserBday(usr.id); // TODO TEST

                const now = moment();

                let foundLastRun = JSON.parse(grabUser.LastRun);

                if (!foundLastRun) {
                  foundLastRun = {};
                }

                const savedDate = new Date(Date.parse(grabUser.Role));
                savedDate.setFullYear(checkDate.getFullYear());
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

                  const role = guild.roles.cache.get(a.Role);

                  if (role) {
                    msg = `It's ${usr}'s birthday! ${role} Say Happy Birthday! 🍰`;
                  } else {
                    msg = `It's ${usr}'s birthday! Say Happy Birthday! 🍰`;
                  }
                  channel.send(msg);

                  // Update the LastRun property with the current timestamp
                  foundLastRun[guild.id] = now.unix();

                  await Birthdays.findOneAndUpdate(
                    {
                      UserId: usr.id // TODO TEST idk if usr.id is right
                    },
                    {
                      LastRun: JSON.stringify(foundLastRun)
                    }
                  );
                }
              })
            );
          })
        );
      },
      null,
      true
    );

    const twoMinuteTimer = new CronJob(
      '*/30 * * * * *',
      async () => {
        // Run every 2 minutes
        // Bans
        const grabBans = await TempBan.find();
        grabBans.map(async (r) => {
          const guild = await this.client.guilds.fetch(r.GuildId);
          if (!guild) return;

          const bans = await guild.bans.fetch();
          const userCheck = bans.filter((ban) => ban.user.id === r.UserId);
          if (!userCheck.first()) {
            await TempBan.deleteOne({ IdJoined: `${guild.id}-${r.UserId}` });
          }

          const botHasPermission = guild.members.me.permissions.has('BanMembers');

          if (!botHasPermission) {
            await TempBan.deleteOne({ IdJoined: `${guild.id}-${r.UserId}` });
            return;
          }

          if (Date.now() > r.EndTime) {
            const embed = new EmbedBuilder()
              .setThumbnail(this.client.user.displayAvatarURL())
              .setColor(this.client.utils.color(guild.members.me.displayHexColor))
              .addFields({
                name: 'Action | Un-Ban',
                value: `**◎ UserId:** ${r.Username}
            **◎ Reason:** Ban time ended.`
              })
              .setTimestamp();

            try {
              await guild.members.unban(r.UserId, 'tempban');
              await TempBan.deleteOne({ IdJoined: `${guild.id}-${r.UserId}` });
            } catch {
              await TempBan.deleteOne({ IdJoined: `${guild.id}-${r.UserId}` });
              return;
            }

            const dbid = await Logging.findOne({ GuildId: guild.id }); // TODO test BIG TIME BIG BRUH DO IT
            const dblogs = dbid.ChannelId;
            const chnCheck = this.client.channels.cache.get(dblogs);
            if (!chnCheck) {
              await Logging.deleteOne({ GuildId: guild.id });
            }

            if (dbid) {
              this.client.channels.cache.get(dblogs).send({ embeds: [embed] });
            }
          }
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

        function replEm(str) {
          const boldStart = /<em>/g;
          const boldEnd = /<\/em>/g;
          const nonLinkBold = /em>/g;
          return str.replace(boldStart, '**').replace(boldEnd, '**').replace(nonLinkBold, '**');
        }

        try {
          const url = 'https://www.merriam-webster.com/word-of-the-day';
          const response = await fetch(url);

          // Use if statements to check for specific error conditions.
          if (!response.ok) {
            // Handle the error...
          }

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

            // Use if statements to check for specific error conditions.
            if (def) {
              const wordDefSplit1 = def.substring(def.indexOf('<p>') + 3);
              const wordDefSplit2 = wordDefSplit1.split('</p>')[0];
              const repl = replEm(wordDefSplit2);
              const output = repl.replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '[**$2**]($1)');
              arr.push({ name: '**Definition:**', value: `>>> *${replEm(output)}*` });
            } else {
              // Handle the error...
            }
          }

          // Example
          const wordEx = $('.wod-definition-container p:eq(1)');
          if (wordEx) {
            const def = wordEx.html();
            const output = def.substring(3).replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '[**$2**]($1)');

            // Use if statements to check for specific error conditions.
            if (def) {
              arr.push({ name: '**Example:**', value: `>>> ${replEm(output)}` });
            } else {
              // Handle the error...
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
        } catch (error) {
          console.log(error);
        }
      },
      null,
      true
    );

    // Run cron jobs
    oneMinTimer.start();
    oneDayTimer.start();
    twoMinuteTimer.start();
    twentyFourTimer.start();
  }
};

export default EventF;
