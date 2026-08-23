import type { Client } from 'discordx';
import { Discord, Once } from 'discordx';
import si from 'systeminformation';
import '@colors/colors';
import { CronJob } from 'cron';
import { ChannelType, Events, version } from 'discord.js';
import StarBoard from '../mongo/StarBoard.js';
import { runBirthdayAnnouncements } from '../utils/Birthday.js';
import { updateStatus } from '../utils/Util.js';

/**
 * Discord.js ClientReady event handler.
 */
@Discord()
export class ClientReady {
    /**
     * Executes when the ClientReady event is emitted.
     * @param client - The Discord client.
     * @returns void
     */
    @Once({ event: Events.ClientReady })
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
                    title: `${client.user?.username} Stats`,
                },
                {
                    content: [
                        `${`${'>>'.magenta} Node: `.white}${process.version.magenta}${' on '.white}${`${process.platform} ${process.arch}`.magenta}`,
                        `${'>>'.cyan} Memory: `.white +
                            `${realMemUsed.toLocaleString('en')}/${totalMemory.toLocaleString('en')} MB`
                                .cyan,
                        `${'>>'.red} CPU: `.white + `${cpu.vendor} ${cpu.brand}`.red,
                        `${'>>'.yellow} Discord.js: `.white + `v${version}`.yellow,
                        `${'>>'.blue} Version: `.white + `v${process.env.npm_package_version}`.blue,
                    ],
                    title: `${client.user?.username} Specs`,
                },
                {
                    content: [
                        `${'>>'.blue} `.white +
                            `https://discordapp.com/oauth2/authorize?client_id=${client.user?.id}&scope=bot%20applications.commands&permissions=535327927376`
                                .blue.underline,
                    ],
                    title: `${client.user?.username} Invite Link`,
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
                if (!(starboard.GuildId && starboard.ChannelId)) {
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
                    // If the bot is no longer in the guild (stale DB row), delete config and move on.
                    const err = error as { code?: number; message?: string };
                    if (err.code === 10_004 || err.message?.includes('Unknown Guild')) {
                        await StarBoard.deleteOne({ GuildId: starboard.GuildId });
                        return;
                    }
                    console.error('Error in Starboard Cron Job:', error);
                }
            })
        );

        const birthdayCron = new CronJob('0 0 0 * * *', async () => {
            try {
                await runBirthdayAnnouncements(client);
            } catch (error) {
                console.error('Error in Birthday Cron Job:', error);
            }
        });

        birthdayCron.start();
    }
}
