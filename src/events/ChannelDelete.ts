import { ChannelType, Events, MessageFlags, PermissionsBitField } from 'discord.js';
import { type ArgsOf, Discord, On } from 'discordx';
import Logging from '../mongo/Logging.js';
import { RagnarokContainer } from '../utils/Util.js';

/**
 * Discord.js ChannelDelete event handler.
 */
@Discord()
export class ChannelDelete {
    /**
     * Executes when the ChannelDelete event is emitted.
     * @param channel
     * @returns void
     */
    @On({ event: Events.ChannelDelete })
    async onChannelDelete([channel]: ArgsOf<'channelDelete'>) {
        if (channel.type === ChannelType.DM) {
            return;
        }

        // If logging is enabled, send an embed to the set channel
        const logging = await Logging.findOne({ GuildId: channel.guild.id });
        if (logging?.ChannelId) {
            const channelId = logging.ChannelId;
            // Fetch the logging channel
            const chn =
                channel.guild?.channels.cache.get(channelId) ??
                (await channel.guild?.channels.fetch(channelId));

            // Check if the channel exists, is a text channel, and has the necessary permissions to send messages
            if (
                chn &&
                chn.type === ChannelType.GuildText &&
                chn
                    .permissionsFor(chn.guild.members.me!)
                    .has(PermissionsBitField.Flags.SendMessages)
            ) {
                const channelType =
                    channel.type === ChannelType.GuildVoice ||
                    channel.type === ChannelType.GuildStageVoice
                        ? 'Voice'
                        : channel.type === ChannelType.GuildCategory
                          ? 'Category'
                          : 'Text';

                const channelDisplay =
                    channelType === 'Category'
                        ? `\`${channel.name}\``
                        : `${channelType === 'Text' ? '#' : ''}${channel.type !== ChannelType.GuildCategory ? channel.name : ''}`;
                const container = RagnarokContainer(
                    `${channelType} Channel Deleted`,
                    `${channelDisplay}\n**ID:** \`${channel.id}\``
                );

                // Send the embed to the logging channel
                if (channel) {
                    chn.send({
                        components: [container],
                        flags: MessageFlags.IsComponentsV2,
                        allowedMentions: { parse: [] },
                    });
                }
            }
        }
    }
}
