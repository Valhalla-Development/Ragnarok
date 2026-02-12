import { ChannelType, Events, MessageFlags, PermissionsBitField } from 'discord.js';
import { type ArgsOf, Discord, On } from 'discordx';
import Logging from '../mongo/Logging.js';
import { RagnarokContainer } from '../utils/Util.js';

/**
 * Discord.js ChannelUpdate event handler.
 */
@Discord()
export class ChannelUpdate {
    /**
     * Executes when the ChannelUpdate event is emitted.
     * @param oldChannel
     * @param newChannel
     * @returns void
     */
    @On({ event: Events.ChannelUpdate })
    async onChannelUpdate([oldChannel, newChannel]: ArgsOf<'channelUpdate'>) {
        if (oldChannel.type === ChannelType.DM || newChannel.type === ChannelType.DM) {
            return;
        }

        // If logging is enabled, send an embed to the set channel
        const logging = await Logging.findOne({ GuildId: oldChannel.guild.id });
        if (logging?.ChannelId) {
            const channelId = logging.ChannelId;
            // Fetch the logging channel
            const chn =
                oldChannel.guild?.channels.cache.get(channelId) ??
                (await oldChannel.guild?.channels.fetch(channelId));

            // Check if the channel exists, is a text channel, and has the necessary permissions to send messages
            if (
                chn &&
                chn.type === ChannelType.GuildText &&
                chn
                    .permissionsFor(chn.guild.members.me!)
                    .has(PermissionsBitField.Flags.SendMessages)
            ) {
                const channelChanges: string[] = [];

                const channelType =
                    oldChannel.type === ChannelType.GuildVoice ||
                    oldChannel.type === ChannelType.GuildStageVoice
                        ? 'Voice'
                        : oldChannel.type === ChannelType.GuildCategory
                          ? 'Category'
                          : 'Text';

                if (oldChannel.name !== newChannel.name) {
                    channelChanges.push(
                        oldChannel.type === ChannelType.GuildCategory
                            ? `**Name**\n\`${oldChannel.name}\` -> (*\`${newChannel.name}\`*)\n`
                            : oldChannel.type === ChannelType.GuildVoice
                              ? `**Name**\n\`${oldChannel.name}\` -> ${newChannel} (*\`${newChannel.name}\`*)\n`
                              : `**Name**\n\`#${oldChannel.name}\` -> ${newChannel} (*\`#${newChannel.name}\`*)\n`
                    );
                }

                if (
                    oldChannel.type === ChannelType.GuildText &&
                    newChannel.type === ChannelType.GuildText &&
                    oldChannel.topic !== newChannel.topic &&
                    newChannel.topic
                ) {
                    const oldTopic = oldChannel.topic === '' ? 'None' : `${oldChannel.topic}`;
                    const newTopic = newChannel.topic === '' ? 'None' : `${newChannel.topic}`;

                    channelChanges.push(`**Topic**\n\`${oldTopic}\` -> \`${newTopic}\`\n`);
                }

                if (
                    oldChannel.type === ChannelType.GuildText &&
                    newChannel.type === ChannelType.GuildText &&
                    oldChannel.nsfw !== newChannel.nsfw
                ) {
                    const oldNs = oldChannel.nsfw ? 'Enabled' : 'Disabled';
                    const newNs = newChannel.nsfw ? 'Enabled' : 'Disabled';

                    channelChanges.push(`**NSFW Status**\n\`${oldNs}\` -> \`${newNs}\`\n`);
                }

                if (channelChanges.length) {
                    const container = RagnarokContainer(
                        `${channelType} Channel Updated`,
                        `${channelChanges.join('\n')}\n**ID:** \`${newChannel.id}\``
                    );

                    if (chn) {
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
}
