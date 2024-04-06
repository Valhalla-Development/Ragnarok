import { ArgsOf, Discord, On } from 'discordx';
import { ChannelType, EmbedBuilder, PermissionsBitField } from 'discord.js';
import Logging from '../mongo/Logging.js';

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
    @On({ event: 'channelDelete' })
    async onChannelDelete([channel]: ArgsOf<'channelDelete'>) {
        if (channel.type === ChannelType.DM) return;

        // If logging is enabled, send an embed to the set channel
        const logging = await Logging.findOne({ GuildId: channel.guild.id });
        if (logging) {
            // Fetch the logging channel
            const chn = channel.guild?.channels.cache.get(logging.ChannelId) ?? await channel.guild?.channels.fetch(logging.ChannelId);

            // Check if the channel exists, is a text channel, and has the necessary permissions to send messages
            if (chn && chn.type === ChannelType.GuildText
                && chn.permissionsFor(chn.guild.members.me!).has(PermissionsBitField.Flags.SendMessages)) {
                const channelType = channel.type === ChannelType.GuildVoice || channel.type === ChannelType.GuildStageVoice ? 'Voice' : (channel.type === ChannelType.GuildCategory ? 'Category' : 'Text');

                // Create an embed with information about the joined member
                const embed = new EmbedBuilder()
                    .setColor('#FE4611')
                    .setAuthor({
                        name: `${channelType} Channel Deleted`,
                        iconURL: `${channel.guild.iconURL()}`,
                    })
                    .setTitle(
                        `${channelType === 'Category'
                            ? `\`${channel.name}\``
                            : `${channelType === 'Text' ? '#' : ''}${channel.type !== ChannelType.GuildCategory ? channel.name : ''}`
                        }`,
                    )
                    .setFooter({ text: `ID: ${channel.id}` })
                    .setTimestamp();

                // Send the embed to the logging channel
                if (channel) chn.send({ embeds: [embed] });
            }
        }
    }
}
