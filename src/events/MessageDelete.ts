import { AuditLogEvent, ChannelType, Events, MessageFlags, PermissionsBitField } from 'discord.js';
import type { ArgsOf } from 'discordx';
import { Discord, On } from 'discordx';
import Logging from '../mongo/Logging.js';
import { RagnarokContainer } from '../utils/Util.js';

@Discord()
export class MessageDelete {
    /**
     * Handler for MessageDelete event.
     * @param message
     */
    @On({ event: Events.MessageDelete })
    async onMessageDelete([message]: ArgsOf<'messageDelete'>) {
        if (!message.guild || message.author?.bot) {
            return;
        }

        // If logging is enabled, send an embed to the set channel
        const logging = await Logging.findOne({ GuildId: message.guild!.id });
        if (logging?.ChannelId) {
            const channelId = logging.ChannelId;
            // Fetch the logging channel
            const chn =
                message.guild?.channels.cache.get(channelId) ??
                (await message.guild?.channels.fetch(channelId));

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
                    const noLogContainer = RagnarokContainer(
                        'Message Deleted',
                        `**No Data:** A message sent by ${message.author} was deleted but no content was found.`
                    );
                    chn.send({
                        components: [noLogContainer],
                        flags: MessageFlags.IsComponentsV2,
                        allowedMentions: { parse: [] },
                    });
                    return;
                }

                const attachments = message.attachments.size
                    ? message.attachments.map((attachment) => attachment.proxyURL)
                    : null;

                if (!(message.content?.length || attachments)) {
                    return;
                }
                const body = [
                    `**Message sent by ${message.author}, deleted in ${message.channel}**`,
                    message.content?.length ? message.content.substring(0, 3900) : '',
                    attachments?.length ? `\n**Attachments:**\n${attachments.join('\n')}` : '',
                    `\n**ID:** \`${message.id}\``,
                ]
                    .filter(Boolean)
                    .join('\n');
                const container = RagnarokContainer('Message Deleted', body);
                chn.send({
                    components: [container],
                    flags: MessageFlags.IsComponentsV2,
                    allowedMentions: { parse: [] },
                });
            }
        }
    }
}
