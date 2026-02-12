import { ChannelType, Events, Guild, MessageFlags, PermissionsBitField } from 'discord.js';
import { type ArgsOf, Discord, On } from 'discordx';
import Logging from '../mongo/Logging.js';
import { RagnarokContainer } from '../utils/Util.js';

/**
 * Discord.js InviteCreate event handler.
 */
@Discord()
export class InviteCreate {
    /**
     * Executes when the InviteCreate event is emitted.
     * @param invite
     * @returns void
     */
    @On({ event: Events.InviteCreate })
    async onInviteCreate([invite]: ArgsOf<'inviteCreate'>) {
        if (invite.guild instanceof Guild) {
            // If logging is enabled, send an embed to the set channel
            const logging = await Logging.findOne({ GuildId: invite.guild!.id });
            if (logging?.ChannelId) {
                const channelId = logging.ChannelId;
                // Fetch the logging channel
                const chn =
                    invite.guild?.channels.cache.get(channelId) ??
                    (await invite.guild?.channels.fetch(channelId));

                // Check if the channel exists, is a text channel, and has the necessary permissions to send messages
                if (
                    chn &&
                    chn.type === ChannelType.GuildText &&
                    chn
                        .permissionsFor(chn.guild.members.me!)
                        .has(PermissionsBitField.Flags.SendMessages)
                ) {
                    const expiry =
                        invite.maxAge !== 0
                            ? `<t:${Math.floor(Date.now() / 1000) + invite.maxAge!}:R>`
                            : '`Never`';

                    const container = RagnarokContainer(
                        'Invite Created',
                        [
                            `**Created By:** ${invite.inviter ?? 'Unknown'}`,
                            `**Expires:** ${expiry}`,
                            `**Location:** ${invite.channel}`,
                            `**Invite:** https://discord.gg/${invite.code}`,
                            `**ID:** \`${invite.code}\``,
                        ].join('\n')
                    );

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
