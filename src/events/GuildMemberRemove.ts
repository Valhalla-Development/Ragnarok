import { ChannelType, Events, MessageFlags, PermissionsBitField } from 'discord.js';
import { type ArgsOf, type Client, Discord, On } from 'discordx';
import Logging from '../mongo/Logging.js';
import { RagnarokContainer, updateStatus } from '../utils/Util.js';

/**
 * Discord.js GuildMemberRemove event handler.
 */
@Discord()
export class GuildMemberRemove {
    /**
     * Executes when the GuildMemberRemove event is emitted.
     * @param member
     * @param client - The Discord client.
     * @returns void
     */
    @On({ event: Events.GuildMemberRemove })
    async onGuildMemberRemove([member]: ArgsOf<'guildMemberRemove'>, client: Client) {
        // Set activity
        updateStatus(client);

        // If logging is enabled, send an embed to the set channel
        const logging = await Logging.findOne({ GuildId: member.guild.id });
        if (logging?.ChannelId) {
            const channelId = logging.ChannelId;
            // Fetch the logging channel
            const channel =
                member.guild?.channels.cache.get(channelId) ??
                (await member.guild?.channels.fetch(channelId));

            // Check if the channel exists, is a text channel, and has the necessary permissions to send messages
            if (
                channel &&
                channel.type === ChannelType.GuildText &&
                channel
                    .permissionsFor(channel.guild.members.me!)
                    .has(PermissionsBitField.Flags.SendMessages)
            ) {
                const container = RagnarokContainer(
                    'Member Left',
                    [
                        `${member} - \`@${member.user.tag}${member.user.discriminator !== '0' ? `#${member.user.discriminator}` : ''}\``,
                        `**Avatar:** ${member.user.displayAvatarURL()}`,
                        `**ID:** \`${member.user.id}\``,
                    ].join('\n')
                );

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
