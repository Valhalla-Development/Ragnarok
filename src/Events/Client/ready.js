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
import Birthdays from '../../Mongo/Schemas/Birthdays.js';
import BirthdayConfig from '../../Mongo/Schemas/BirthdayConfig.js';
import TempBan from '../../Mongo/Schemas/TempBan.js';
import Logging from '../../Mongo/Schemas/Logging.js';
import Balance from '../../Mongo/Schemas/Balance.js';
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

    await Promise.all(
      grabStarboard.map(async (s) => {
        const guild = this.client.guilds.cache.get(s.GuildId);
        if (!guild) return;

        const channel = guild.channels.cache.get(s.ChannelId);
        if (!channel) return;

        // Cache messages
        await channel.messages.fetch({ limit: 10 });
      })
    );

    // Cooldowns
    // Define a function to update the farms for a given user
    const oneMinTimer = new CronJob(
      '0 * * * * *',
      async () => {
        const currentTime = moment();

        try {
          const pipeline = [
            {
              $group: {
                _id: '$IdJoined',
                FarmPlot: { $push: '$FarmPlot' },
                HarvestedCrops: { $push: '$HarvestedCrops' }
              }
            },
            {
              $project: {
                _id: 0,
                IdJoined: '$_id',
                FarmPlot: { $reduce: { input: '$FarmPlot', initialValue: [], in: { $concatArrays: ['$$value', '$$this'] } } },
                HarvestedCrops: { $reduce: { input: '$HarvestedCrops', initialValue: [], in: { $concatArrays: ['$$value', '$$this'] } } }
              }
            }
          ];

          const groupBalances = await Balance.aggregate(pipeline);

          const bulkOps = [];

          for (const groupBalance of groupBalances) {
            const { IdJoined, FarmPlot, HarvestedCrops } = groupBalance;

            const updatedPlots = FarmPlot.map((plot) => {
              const plotGrowTime = moment.unix(plot.CropGrowTime / 1000);
              if (currentTime.diff(plotGrowTime) >= 0) {
                plot.CropStatus = 'harvest';
                plot.CropGrowTime = 'na';
                plot.Decay = 0;
              }

              if (plot.CropStatus === 'harvest') {
                if (plot.Decay >= 100) {
                  return null;
                }

                plot.Decay += this.client.ecoPrices.DecayRate;
              }

              return plot;
            }).filter((plot) => plot !== null);

            const updatedCrops = HarvestedCrops.map((crop) => {
              if (crop.Decay >= 100) {
                return null;
              }

              crop.Decay += this.client.ecoPrices.DecayRate * 6;

              return crop;
            }).filter((crop) => crop !== null);

            if (updatedPlots.length === 0) {
              groupBalance.FarmPlot = [];
            } else {
              groupBalance.FarmPlot = updatedPlots;
            }

            if (updatedCrops.length === 0) {
              groupBalance.HarvestedCrops = [];
            } else {
              groupBalance.HarvestedCrops = updatedCrops;
            }

            const filter = { IdJoined };
            const update = {
              $set: {
                FarmPlot: groupBalance.FarmPlot,
                HarvestedCrops: groupBalance.HarvestedCrops
              }
            };
            bulkOps.push({ updateMany: { filter, update } });
          }

          await Balance.bulkWrite(bulkOps);
        } catch (error) {
          console.error(`Error updating farms: ${error}`);
        }
      },
      null,
      true
    );

    const oneDayTimer = new CronJob(
        '0 0 0 * * *',
        async () => {
          try {
            const grabBdays = await Birthdays.find();
            const grabBdaysConfig = await BirthdayConfig.find();

            const findUserBday = async (id) => Birthdays.findOne({ UserId: id });

            await Promise.all(
                grabBdaysConfig.map(async (a) => {
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
                  checkDate.setHours(0, 0, 0, 0);

                  await Promise.all(
                      grabBdays.map(async (b) => {
                        const usr = await guild.members.fetch(b.UserId);
                        if (!usr) return

                        const grabUser = await findUserBday(usr.id);

                        const now = moment();

                        let foundLastRun = grabUser?.LastRun || []

                        const savedDate = new Date(Date.parse(grabUser?.Date));
                        savedDate.setFullYear(checkDate.getFullYear());
                        savedDate.setHours(0, 0, 0, 0);

                        if (checkDate.getTime() === savedDate.getTime()) {
                          const lastRunForGuild = foundLastRun.find((entry) => entry[guild.id]);
                          if (lastRunForGuild && now.unix() < lastRunForGuild[guild.id] + 86400) {
                            return;
                          }

                          const role = a.Role ? await guild.roles.fetch(a.Role) : null;
                          const msg = `It's ${usr}'s birthday! ${role ? `${role} Say Happy Birthday! 🍰` : 'Say Happy Birthday! 🍰'}`;

                          try {
                            await channel.send(msg);

                            const guildIndex = foundLastRun.findIndex(obj => obj[guild.id]);

                            if (guildIndex === -1) {
                              foundLastRun.push({ [guild.id]: now.unix() });
                            } else {
                              foundLastRun[guildIndex][guild.id] = now.unix();
                            }

                            await Birthdays.findOneAndUpdate(
                                { UserId: usr.id },
                                { LastRun: foundLastRun }
                            );
                          } catch (error) {
                            console.error(`Error sending birthday message for ${usr}:`, error);
                          }
                        }
                      })
                  );
                })
            );
          } catch (error) {
            console.error('Error in Birthday Cron Job:', error);
          }
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
            await TempBan.deleteOne({ IdJoined: `${r.UserId}-${guild.id}` });
          }

          const botHasPermission = guild.members.me.permissions.has('BanMembers');

          if (!botHasPermission) {
            await TempBan.deleteOne({ IdJoined: `${r.UserId}-${guild.id}` });
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
              await TempBan.deleteOne({ IdJoined: `${r.UserId}-${guild.id}` });
            } catch {
              await TempBan.deleteOne({ IdJoined: `${r.UserId}-${guild.id}` });
              return;
            }

            const dbid = await Logging.findOne({ GuildId: guild.id });
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

    const replEm = (str) => {
      const boldStart = /<em>/g;
      const boldEnd = /<\/em>/g;
      const nonLinkBold = /em>/g;
      return str.replace(boldStart, '**').replace(boldEnd, '**').replace(nonLinkBold, '**');
    };

    const twentyFourTimer = new CronJob(
      '0 13 * * *',
      async () => {
        try {
          const guild = this.client.guilds.cache.get('657235952116170794');
          const chn = guild?.channels.cache.get('663193215943311373');
          if (!chn) return;

          const url = 'https://www.merriam-webster.com/word-of-the-day';
          const response = await fetch(url);

          if (!response.ok) {
            return console.log('Failed to fetch word of the day:', response.statusText);
          }

          const body = await response.text();
          const $ = load(body);

          const wordClass = $('.word-and-pronunciation');
          const wordHeader = wordClass.find('.word-header-txt');
          const word = wordHeader.text();
          const typeFetch = $('.main-attr');
          const type = typeFetch.text();
          const syllablesFetch = $('.word-syllables');
          const syllables = syllablesFetch.text();

          const arr = [];

          const wordDef = $('.wod-definition-container');
          if (wordDef.length) {
            const def = wordDef.html();
            const wordDefSplit1 = def.substring(def.indexOf('<p>') + 3);
            const wordDefSplit2 = wordDefSplit1.split('</p>')[0];
            const repl = replEm(wordDefSplit2);
            const output = repl.replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '[**$2**]($1)');
            arr.push({ name: '**Definition:**', value: `>>> *${replEm(output)}*` });
          }

          const wordEx = $('.wod-definition-container p:eq(1)');
          if (wordEx.length) {
            const def = wordEx.html();
            const output = def.substring(3).replace(/<a href="([^"]+)">([^<]+)<\/a>/g, '[**$2**]($1)');
            arr.push({ name: '**Example:**', value: `>>> ${replEm(output)}` });
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
