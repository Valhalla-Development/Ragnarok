import { CronJob } from 'cron';
import { ChannelType, Events, OAuth2Scopes, PermissionsBitField, version } from 'discord.js';
import { type Client, Discord, Once } from 'discordx';
import si from 'systeminformation';
import { version as botVersion } from '../../package.json' with { type: 'json' };
import StarBoard from '../mongo/StarBoard.js';
import { runBirthdayAnnouncements } from '../utils/Birthday.js';
import { log } from '../utils/Console.js';
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

        if (!client.user) {
            return;
        }

        const memory = await si.mem();
        const cpu = await si.cpu();
        const totalMemory = Math.floor(memory.total / 1024 / 1024);
        const realMemUsed = Math.floor((memory.used - memory.buffcache) / 1024 / 1024);
        const inviteUrl = client.generateInvite({
            permissions: [
                PermissionsBitField.Flags.ManageChannels,
                PermissionsBitField.Flags.AddReactions,
                PermissionsBitField.Flags.ViewChannel,
                PermissionsBitField.Flags.SendMessages,
                PermissionsBitField.Flags.ManageMessages,
                PermissionsBitField.Flags.EmbedLinks,
                PermissionsBitField.Flags.AttachFiles,
                PermissionsBitField.Flags.ReadMessageHistory,
                PermissionsBitField.Flags.MentionEveryone,
                PermissionsBitField.Flags.UseExternalEmojis,
                PermissionsBitField.Flags.ChangeNickname,
                PermissionsBitField.Flags.ManageWebhooks,
                PermissionsBitField.Flags.UseApplicationCommands,
                PermissionsBitField.Flags.ManageThreads,
                PermissionsBitField.Flags.CreatePublicThreads,
                PermissionsBitField.Flags.CreatePrivateThreads,
                PermissionsBitField.Flags.UseExternalStickers,
                PermissionsBitField.Flags.SendMessagesInThreads,
            ],
            scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
        });

        const heapMb = Math.floor(process.memoryUsage().heapUsed / 1024 / 1024);
        const shardIds = [...client.ws.shards.keys()];
        const clustered =
            'cluster' in client && client.cluster
                ? `Cluster ${(client.cluster as { id: number }).id}`
                : 'single process';
        const memPctLabel =
            totalMemory > 0 ? `  (${((realMemUsed / totalMemory) * 100).toFixed(1)}%)` : '';

        log.ready({
            boot: `${process.uptime().toFixed(2)}s`,
            channels: client.channels.cache.size,
            cluster: clustered,
            commands: client.application?.commands.cache.size ?? 0,
            cpu: `${cpu.vendor} ${cpu.brand}`,
            discord: `v${version}`,
            events: client.eventNames().length,
            guilds: client.guilds.cache.size,
            heap: `${heapMb.toLocaleString('en')} MB`,
            invite: inviteUrl,
            memory: `${realMemUsed.toLocaleString('en')} / ${totalMemory.toLocaleString('en')} MB${memPctLabel}`,
            name: client.user.username,
            pid: String(process.pid),
            runtime: process.versions.bun
                ? `Bun ${process.versions.bun} · ${process.platform} ${process.arch}`
                : `${process.version} · ${process.platform} ${process.arch}`,
            shards: shardIds.length > 0 ? `${shardIds.length}  ·  ${shardIds.join(', ')}` : '1',
            users: client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0),
            version: `v${botVersion}`,
        });

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
                    log.error('Starboard warmup failed', error);
                }
            })
        );

        const birthdayCron = new CronJob('0 0 0 * * *', async () => {
            try {
                await runBirthdayAnnouncements(client);
            } catch (error) {
                log.error('Birthday cron job failed', error);
            }
        });

        birthdayCron.start();
    }
}
