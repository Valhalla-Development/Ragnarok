import { ArgsOf, Discord, On } from 'discordx';
import {
    AuditLogEvent, ChannelType, EmbedBuilder, PermissionsBitField,
} from 'discord.js';
import Logging from '../mongo/Logging.js';

/**
 * Discord.js GuildBanAdd event handler.
 */
@Discord()
export class GuildBanAdd {
    /**
     * Executes when the GuildBanAdd event is emitted.
     * @param ban
     * @param client - The Discord client.
     * @returns void
     */
    @On({ event: 'guildBanAdd' })
    async onGuildBanAdd([ban]: ArgsOf<'guildBanAdd'>) {
        // If logging is enabled, send an embed to the set channel
        const logging = await Logging.findOne({ GuildId: ban.guild.id });
        if (logging) {
            // Fetch the logging channel
            const channel = ban.guild?.channels.cache.get(logging.ChannelId) ?? await ban.guild?.channels.fetch(logging.ChannelId);

            const entry = await ban.guild.fetchAuditLogs({ type: AuditLogEvent.MemberBanAdd }).then((audit) => audit.entries.first());

            // Check if the channel exists, is a text channel, and has the necessary permissions to send messages
            if (channel && channel.type === ChannelType.GuildText
                && channel.permissionsFor(channel.guild.members.me!).has(PermissionsBitField.Flags.SendMessages)) {
                // Create an embed with information about the banned member
                const embed = new EmbedBuilder()
                    .setColor('#FE4611')
                    .setAuthor({ name: 'Member Banned', iconURL: ban.user.displayAvatarURL() })
                    .setThumbnail(ban.user.displayAvatarURL())
                    .setDescription(`${ban.user} - \`@${ban.user.tag}${ban.user.discriminator !== '0' ? `#${ban.user.discriminator}` : ''}\``)
                    .setFooter({ text: `ID: ${ban.user.id}` })
                    .setTimestamp();

                // Add a field for the ban reason if it exists
                if (entry && entry.reason) {
                    embed.addFields({ name: 'Reason', value: `\`${entry.reason}\`` });
                }

                if (entry && entry.executor) {
                    embed.addFields({ name: 'Moderator', value: `${entry.executor}` });
                }

                // Send the embed to the logging channel
                if (channel) channel.send({ embeds: [embed] });
            }
        }
    }
}
