import { ChannelType, EmbedBuilder, Events, PermissionsBitField } from 'discord.js';
import { type ArgsOf, Discord, On } from 'discordx';
import Logging from '../mongo/Logging.js';

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
        if (logging) {
            // Fetch the logging channel
            const chn =
                oldChannel.guild?.channels.cache.get(logging.ChannelId) ??
                (await oldChannel.guild?.channels.fetch(logging.ChannelId));

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
                    // Create an embed with information about the joined member
                    const embed = new EmbedBuilder()
                        .setColor('#FE4611')
                        .setAuthor({
                            name: `${channelType} Channel Updated`,
                            iconURL: `${oldChannel.guild.iconURL()}`,
                        })
                        .setDescription(channelChanges.join('\n'))
                        .setFooter({ text: `ID: ${newChannel.id}` })
                        .setTimestamp();

                    // Send the embed to the logging channel
                    if (chn) {
                        chn.send({ embeds: [embed] });
                    }
                }
            }
        }
    }
}
