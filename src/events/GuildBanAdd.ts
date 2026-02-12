import { AuditLogEvent, ChannelType, Events, MessageFlags, PermissionsBitField } from 'discord.js';
import { type ArgsOf, Discord, On } from 'discordx';
import Logging from '../mongo/Logging.js';
import { RagnarokContainer } from '../utils/Util.js';

/**
 * Discord.js GuildBanAdd event handler.
 */
@Discord()
export class GuildBanAdd {
    /**
     * Executes when the GuildBanAdd event is emitted.
     * @param ban
     * @returns void
     */
    @On({ event: Events.GuildBanAdd })
    async onGuildBanAdd([ban]: ArgsOf<'guildBanAdd'>) {
        // If logging is enabled, send an embed to the set channel
        const logging = await Logging.findOne({ GuildId: ban.guild.id });
        if (logging?.ChannelId) {
            const channelId = logging.ChannelId;
            // Fetch the logging channel
            const channel =
                ban.guild?.channels.cache.get(channelId) ??
                (await ban.guild?.channels.fetch(channelId));

            const entry = await ban.guild
                .fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd })
                .then((audit) => audit.entries.first());

            // Check if the channel exists, is a text channel, and has the necessary permissions to send messages
            if (
                channel &&
                channel.type === ChannelType.GuildText &&
                channel
                    .permissionsFor(channel.guild.members.me!)
                    .has(PermissionsBitField.Flags.SendMessages)
            ) {
                const lines = [
                    `${ban.user} - \`@${ban.user.tag}${ban.user.discriminator !== '0' ? `#${ban.user.discriminator}` : ''}\``,
                    `**Avatar:** ${ban.user.displayAvatarURL()}`,
                    `**ID:** \`${ban.user.id}\``,
                ];
                if (entry?.reason) {
                    lines.push(`**Reason:** \`${entry.reason}\``);
                }
                if (entry?.executor) {
                    lines.push(`**Moderator:** ${entry.executor}`);
                }
                const container = RagnarokContainer('Member Banned', lines.join('\n'));

                // Send the embed to the logging channel
                if (channel) {
                    channel.send({
                        components: [container],
                        flags: MessageFlags.IsComponentsV2,
                        allowedMentions: { parse: [] },
                    });
                }
            }
        }
    }
}
