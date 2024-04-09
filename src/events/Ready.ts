import type { Client } from 'discordx';
import { Discord, Once } from 'discordx';
import si from 'systeminformation';
import 'colors';
import { ActivityType, ChannelType, version } from 'discord.js';
import { CronJob } from 'cron';
import moment from 'moment';
import StarBoard from '../mongo/StarBoard.js';
import Birthdays from '../mongo/Birthdays.js';
import BirthdayConfig from '../mongo/BirthdayConfig.js';

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

        // Fetch stats
        const memory = await si.mem();
        const totalMemory = Math.floor(memory.total / 1024 / 1024);
        const cachedMem = memory.buffcache / 1024 / 1024;
        const memoryUsed = memory.used / 1024 / 1024;
        const realMemUsed = Math.floor(memoryUsed - cachedMem);

        // Bot Info
        console.log(
            '\n',
            `——————————[${client.user?.username} Info]——————————`.red.bold,
        );
        console.log(
            'Users:'.white.bold,
            `${client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0).toLocaleString('en')}`.yellow.bold,
        );
        console.log(
            'Guilds:'.white.bold,
            `${client.guilds.cache.size.toLocaleString('en')}`.yellow.bold,
        );
        console.log(
            'Slash Commands:'.white.bold,
            `${client.applicationCommands.length}`.yellow.bold,
        );
        console.log(
            'Events:'.white.bold,
            `${client.events.length}`.yellow.bold,
        );
        console.log(
            'Invite:'.white.bold,
            `https://discordapp.com/oauth2/authorize?client_id=${client.user?.id}&scope=bot%20applications.commands&permissions=535327927376`.blue.underline.bold,
        );

        // Bot Specs
        console.log(
            '\n',
            `——————————[${client.user?.username} Specs]——————————`.red.bold,
        );
        console.log(
            'Running Node:'.white.bold,
            `${process.version}`.magenta.bold,
            'on'.white.bold,
            `${process.platform} ${process.arch}`.magenta.bold,
        );
        console.log(
            'Memory:'.white.bold,
            `${realMemUsed.toLocaleString('en')}`.yellow.bold,
            '/'.white.bold,
            `${totalMemory.toLocaleString('en')}`.yellow.bold,
            'MB'.white.bold,
        );
        console.log(
            'Discord.js Version:'.white.bold,
            `${version}`.green.bold,
        );
        console.log(
            `${client.user?.username} Version:`.white.bold,
            `${process.env.npm_package_version}`.green.bold,
            '\n',
        );

        // Set activity
        client.user?.setActivity({
            type: ActivityType.Watching,
            name: `${client.guilds.cache.size.toLocaleString('en')} Guilds
            ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')} Users`,
        });

        // On guilds with Starboard enabled, fetch the channel and the last 10 messages in the channel
        const starboards = await StarBoard.find();

        await Promise.all(
            starboards.map(async (starboard) => {
                if (!starboard.GuildId || !starboard.ChannelId) return;

                const guild = await client.guilds.fetch(starboard.GuildId);
                if (!guild) return;

                const channel = await guild.channels.fetch(starboard.ChannelId);
                if (!channel || channel.type !== ChannelType.GuildText) return;

                await channel.messages.fetch({ limit: 10 });
            }),
        );

        // Run a cron job once per day to check for users' birthdays
        const birthdayCron = new CronJob(
            '0 0 0 * * *',
            async () => {
                try {
                    const birthdays = await Birthdays.find();
                    const birthdayConfigs = await BirthdayConfig.find();

                    const findUserBirthday = async (id: string) => Birthdays.findOne({ UserId: id });

                    await Promise.all(birthdayConfigs.map(async (config) => {
                        if (!config.GuildId) return;

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

                        await Promise.all(birthdays.map(async (birthday) => {
                            if (!birthday.UserId || !guild.members.cache.has(birthday.UserId)) return;

                            const user = await guild.members.fetch(birthday.UserId);
                            if (!user) return;

                            const userBirthday = await findUserBirthday(user.id);
                            if (!userBirthday) return;

                            const now = moment();
                            const lastRunGuild = userBirthday?.LastRun || [];

                            const savedDate = new Date(Date.parse(userBirthday.Date));
                            savedDate.setFullYear(currentDate.getFullYear());
                            savedDate.setHours(0, 0, 0, 0);

                            if (currentDate.getTime() === savedDate.getTime()) {
                                const lastRunForGuild = lastRunGuild.find((entry) => entry[guild.id]);
                                if (lastRunForGuild && now.unix() < lastRunForGuild[guild.id] + 86400) return;

                                const message = `It's ${user}'s birthday! Say Happy Birthday! 🍰`;

                                try {
                                    if (channel.type === ChannelType.GuildText) await channel.send(message);

                                    const guildIndex = lastRunGuild.findIndex((obj) => obj[guild.id]);

                                    if (guildIndex === -1) {
                                        lastRunGuild.push({ [guild.id]: now.unix() });
                                    } else {
                                        lastRunGuild[guildIndex][guild.id] = now.unix();
                                    }

                                    await Birthdays.findOneAndUpdate({ UserId: user.id }, { LastRun: lastRunGuild });
                                } catch (error) {
                                    console.error(`Error sending birthday message for ${user}:`, error);
                                }
                            }
                        }));
                    }));
                } catch (error) {
                    console.error('Error in Birthday Cron Job:', error);
                }
            },
            null,
            true,
        );

        // Run the birthdayCron job
        birthdayCron.start();
    }
}
