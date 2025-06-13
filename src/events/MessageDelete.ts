import { AuditLogEvent, ChannelType, EmbedBuilder, PermissionsBitField } from 'discord.js';
import type { ArgsOf } from 'discordx';
import { Discord, On } from 'discordx';
import Logging from '../mongo/Logging.js';
import { color } from '../utils/Util.js';

@Discord()
export class MessageDelete {
    /**
     * Handler for MessageDelete event.
     * @param message
     */
    @On({ event: 'messageDelete' })
    async onMessageDelete([message]: ArgsOf<'messageDelete'>) {
        if (!message.guild || message.author?.bot) {
            return;
        }

        // If logging is enabled, send an embed to the set channel
        const logging = await Logging.findOne({ GuildId: message.guild!.id });
        if (logging) {
            // Fetch the logging channel
            const chn =
                message.guild?.channels.cache.get(logging.ChannelId) ??
                (await message.guild?.channels.fetch(logging.ChannelId));

            // Check if the channel exists, is a text channel, and has the necessary permissions to send messages
            if (
                chn &&
                chn.type === ChannelType.GuildText &&
                chn
                    .permissionsFor(chn.guild.members.me!)
                    .has(PermissionsBitField.Flags.SendMessages)
            ) {
                const fetchedLogs = await message.guild.fetchAuditLogs({
                    limit: 1,
                    type: AuditLogEvent.MessageDelete,
                });
                const deletionLog = fetchedLogs.entries.first();

                if (!deletionLog) {
                    const noLogE = new EmbedBuilder()
                        .setColor(color(message.guild!.members.me!.displayHexColor))
                        .setAuthor({
                            name: 'Message Deleted',
                            iconURL: `${message.guild.iconURL()}`,
                        })
                        .setTitle('Message Deleted')
                        .setDescription(
                            `**◎ No Data:** A message sent by ${message.author} was deleted but no content was found.**`
                        )
                        .setTimestamp();
                    chn.send({ embeds: [noLogE] });
                    return;
                }

                const attachments = message.attachments.size
                    ? message.attachments.map((attachment) => attachment.proxyURL)
                    : null;

                const embed = new EmbedBuilder()
                    .setColor('#FE4611')
                    .setAuthor({
                        name: 'Message Deleted',
                        iconURL: `${message.guild!.iconURL()}`,
                    })
                    .setDescription(
                        `**Message sent by ${message.author}, deleted in ${message.channel}**${message.content?.length ? `\n${message.content.substring(0, 3900)}` : ''}`
                    )
                    .setFooter({ text: `ID: ${message.id}` })
                    .setTimestamp();

                if (attachments) {
                    embed.addFields({
                        name: '**Attachments:**',
                        value: `${attachments.join('\n')}`,
                    });
                }

                if (!message.content?.length && !attachments) {
                    return;
                }

                // Send the embed to the logging channel
                chn.send({ embeds: [embed] });
            }
        }
    }
}
