import { AuditLogEvent, ChannelType, EmbedBuilder, Events, PermissionsBitField } from 'discord.js';
import { type ArgsOf, Discord, On } from 'discordx';
import Logging from '../mongo/Logging.js';

/**
 * Discord.js GuildBanRemove event handler.
 */
@Discord()
export class GuildBanRemove {
    /**
     * Executes when the GuildBanRemove event is emitted.
     * @param ban
     * @returns void
     */
    @On({ event: Events.GuildBanRemove })
    async onGuildBanRemove([ban]: ArgsOf<'guildBanRemove'>) {
        // If logging is enabled, send an embed to the set channel
        const logging = await Logging.findOne({ GuildId: ban.guild.id });
        if (logging?.ChannelId) {
            const channelId = logging.ChannelId;
            // Fetch the logging channel
            const channel =
                ban.guild?.channels.cache.get(channelId) ??
                (await ban.guild?.channels.fetch(channelId));

            const entry = await ban.guild
                .fetchAuditLogs({ type: AuditLogEvent.MemberBanRemove })
                .then((audit) => audit.entries.first());

            // Check if the channel exists, is a text channel, and has the necessary permissions to send messages
            if (
                channel &&
                channel.type === ChannelType.GuildText &&
                channel
                    .permissionsFor(channel.guild.members.me!)
                    .has(PermissionsBitField.Flags.SendMessages)
            ) {
                // Create an embed with information about the unbanned member
                const embed = new EmbedBuilder()
                    .setColor('#FE4611')
                    .setAuthor({ name: 'Member Unbanned', iconURL: ban.user.displayAvatarURL() })
                    .setThumbnail(ban.user.displayAvatarURL())
                    .setDescription(
                        `${ban.user} - \`@${ban.user.tag}${ban.user.discriminator !== '0' ? `#${ban.user.discriminator}` : ''}\``
                    )
                    .setFooter({ text: `ID: ${ban.user.id}` })
                    .setTimestamp();

                if (entry?.executor) {
                    embed.addFields({ name: 'Moderator', value: `${entry.executor}` });
                }

                // Send the embed to the logging channel
                if (channel) {
                    channel.send({ embeds: [embed] });
                }
            }
        }
    }
}
