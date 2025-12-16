import { ChannelType, EmbedBuilder, PermissionsBitField } from 'discord.js';
import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';
import Logging from '../mongo/Logging.js';

@Discord()
export class MessageDeleteBulk {
    /**
     * Handler for MessageDeleteBulk event.
     * @param messages
     * @param client - The Discord client.
     */
    @On({ event: 'messageDeleteBulk' })
    async onMessageDelete([messages]: ArgsOf<'messageDeleteBulk'>, client: Client) {
        if (!messages.first()) {
            return;
        }

        const guild = client.guilds.cache.get(messages.first()?.guildId ?? '');
        if (!guild) {
            return;
        }

        const channel = guild.channels.cache.get(messages.first()!.channelId);
        if (!channel) {
            return;
        }

        // If logging is enabled, send an embed to the set channel
        const logging = await Logging.findOne({ GuildId: guild.id });
        if (logging) {
            // Fetch the logging channel
            const chn =
                guild.channels.cache.get(logging.ChannelId) ??
                (await guild.channels.fetch(logging.ChannelId));

            // Check if the channel exists, is a text channel, and has the necessary permissions to send messages
            if (
                chn &&
                chn.type === ChannelType.GuildText &&
                chn
                    .permissionsFor(chn.guild.members.me!)
                    .has(PermissionsBitField.Flags.SendMessages)
            ) {
                const embed = new EmbedBuilder()
                    .setColor('#FE4611')
                    .setAuthor({
                        name: 'Messages Deleted',
                        iconURL: `${guild.iconURL()}`,
                    })
                    .setDescription(
                        `**Bulk Delete in ${channel}, ${messages.size} messages deleted**`
                    )
                    .setTimestamp();

                // Send the embed to the logging channel
                chn.send({ embeds: [embed] });
            }
        }
    }
}
