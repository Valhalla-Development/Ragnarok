import type { Client } from 'discordx';
import { Discord, Once } from 'discordx';
import si from 'systeminformation';
import '@colors/colors';
import { CronJob } from 'cron';
import { ChannelType, version } from 'discord.js';
import moment from 'moment';
import { updateStatus } from 'utils/Util.js';
import BirthdayConfig from '../mongo/BirthdayConfig.js';
import Birthdays from '../mongo/Birthdays.js';
import StarBoard from '../mongo/StarBoard.js';

/**
 * Discord.js Ready event handler.
 */
@Discord()
export class Ready {
    /**
     * Executes when the ready event is emitted.
     * @param client - The Discord client.
     * @returns void
     */
    @Once({ event: 'ready' })
    async onReady([client]: [Client]) {
        // Init slash commands
        await client.initApplicationCommands();

        async function logStartup(): Promise<void> {
            const memory = await si.mem();
            const cpu = await si.cpu();
            const totalMemory = Math.floor(memory.total / 1024 / 1024);
            const realMemUsed = Math.floor((memory.used - memory.buffcache) / 1024 / 1024);

            const divider = '*~'.repeat(20);
            const sections = [
                {
                    content: [
                        divider.rainbow.bold,
                        `${client.user?.username} is online and ready!`.cyan.bold,
                        divider.rainbow.bold,
                    ],
                },
                {
                    title: `${client.user?.username} Stats`,
                    content: [
                        `${'>>'.red} Users: `.white +
                            client.guilds.cache
                                .reduce((acc: number, guild) => acc + guild.memberCount, 0)
                                .toLocaleString('en').red,
                        `${'>>'.green} Guilds: `.white +
                            client.guilds.cache.size.toLocaleString('en').green,
                        `${'>>'.yellow} Slash Commands: `.white +
                            `${client.application?.commands.cache.size ?? 0}`.yellow,
                        `${'>>'.blue} Events: `.white + client.eventNames().length.toString().blue,
                    ],
                },
                {
                    title: `${client.user?.username} Specs`,
                    content: [
                        `${`${'>>'.magenta} Node: `.white}${process.version.magenta}${' on '.white}${`${process.platform} ${process.arch}`.magenta}`,
                        `${'>>'.cyan} Memory: `.white +
                            `${realMemUsed.toLocaleString('en')}/${totalMemory.toLocaleString('en')} MB`
                                .cyan,
                        `${'>>'.red} CPU: `.white + `${cpu.vendor} ${cpu.brand}`.red,
                        `${'>>'.yellow} Discord.js: `.white + `v${version}`.yellow,
                        `${'>>'.blue} Version: `.white + `v${process.env.npm_package_version}`.blue,
                    ],
                },
                {
                    title: `${client.user?.username} Invite Link`,
                    content: [
                        `${'>>'.blue} `.white +
                            `https://discordapp.com/oauth2/authorize?client_id=${client.user?.id}&scope=bot%20applications.commands&permissions=535327927376`
                                .blue.underline,
                    ],
                },
            ];

            console.log(`\n${'='.repeat(50).bold}`);
            for (const section of sections) {
                if (section.title) {
                    console.log(`\n>>> ${section.title} <<<`.magenta.bold);
                }
                for (const line of section.content) {
                    console.log(`${line}`.bold);
                }
            }
            console.log(`${'='.repeat(50).bold}`);
        }

        await logStartup();

        // Set activity
        updateStatus(client);

        // On guilds with Starboard enabled, fetch the channel and the last 10 messages in the channel
        const starboards = await StarBoard.find();

        await Promise.all(
            starboards.map(async (starboard) => {
                if (!starboard.GuildId || !starboard.ChannelId) {
                    return;
                }

                try {
                    const guild = await client.guilds.fetch(starboard.GuildId);
                    if (!guild) {
                        await StarBoard.deleteOne({ GuildId: starboard.GuildId });
                        return;
                    }

                    const channel = await guild.channels
                        .fetch(starboard.ChannelId)
                        .catch(() => null);
                    if (!channel || channel.type !== ChannelType.GuildText) {
                        await StarBoard.deleteOne({ GuildId: starboard.GuildId });
                        return;
                    }

                    await channel.messages.fetch({ limit: 10 });
                } catch (error) {
                    console.error('Error in Starboard Cron Job:', error);
                }
            })
        );

        // Run a cron job once per day to check for users' birthdays
        const birthdayCron = new CronJob(
            '0 0 0 * * *',
            async () => {
                try {
                    const birthdays = await Birthdays.find();
                    const birthdayConfigs = await BirthdayConfig.find();

                    const findUserBirthday = async (id: string) =>
                        Birthdays.findOne({ UserId: id });

                    await Promise.all(
                        birthdayConfigs.map(async (config) => {
                            if (!config.GuildId) {
                                return;
                            }

                            const guild = client.guilds.cache.get(config.GuildId);
                            if (!guild) {
                                await BirthdayConfig.deleteMany({ GuildId: config.GuildId });
                                return;
                            }

                            const channel = guild.channels.cache.get(config.ChannelId);
                            if (!channel) {
                                await BirthdayConfig.deleteMany({ GuildId: config.GuildId });
                                return;
                            }

                            const currentDate = new Date();
                            currentDate.setHours(0, 0, 0, 0);

                            await Promise.all(
                                birthdays.map(async (birthday) => {
                                    if (
                                        !birthday.UserId ||
                                        !guild.members.cache.has(birthday.UserId)
                                    ) {
                                        return;
                                    }

                                    const user = await guild.members.fetch(birthday.UserId);
                                    if (!user) {
                                        return;
                                    }

                                    const userBirthday = await findUserBirthday(user.id);
                                    if (!userBirthday) {
                                        return;
                                    }

                                    const now = moment();
                                    const lastRunGuild = userBirthday?.LastRun || [];

                                    const savedDate = new Date(Date.parse(userBirthday.Date));
                                    savedDate.setFullYear(currentDate.getFullYear());
                                    savedDate.setHours(0, 0, 0, 0);

                                    if (currentDate.getTime() === savedDate.getTime()) {
                                        const lastRunForGuild = lastRunGuild.find(
                                            (entry) => entry[guild.id]
                                        );
                                        if (
                                            lastRunForGuild &&
                                            now.unix() < lastRunForGuild[guild.id] + 86400
                                        ) {
                                            return;
                                        }

                                        const message = `It's ${user}'s birthday! Say Happy Birthday! 🍰`;

                                        try {
                                            if (channel.type === ChannelType.GuildText) {
                                                await channel.send(message);
                                            }

                                            const guildIndex = lastRunGuild.findIndex(
                                                (obj) => obj[guild.id]
                                            );

                                            if (guildIndex === -1) {
                                                lastRunGuild.push({ [guild.id]: now.unix() });
                                            } else {
                                                lastRunGuild[guildIndex][guild.id] = now.unix();
                                            }

                                            await Birthdays.findOneAndUpdate(
                                                { UserId: user.id },
                                                { LastRun: lastRunGuild }
                                            );
                                        } catch (error) {
                                            console.error(
                                                `Error sending birthday message for ${user}:`,
                                                error
                                            );
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

        // Run the birthdayCron job
        birthdayCron.start();
    }
}
