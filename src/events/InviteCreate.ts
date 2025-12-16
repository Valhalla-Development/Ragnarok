import { ChannelType, EmbedBuilder, Events, Guild, PermissionsBitField } from 'discord.js';
import { type ArgsOf, Discord, On } from 'discordx';
import Logging from '../mongo/Logging.js';

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
            if (logging) {
                // Fetch the logging channel
                const chn =
                    invite.guild?.channels.cache.get(logging.ChannelId) ??
                    (await invite.guild?.channels.fetch(logging.ChannelId));

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

                    const embed = new EmbedBuilder()
                        .setColor('#FE4611')
                        .setAuthor({
                            name: 'Invite Created',
                            iconURL: `${invite.guild!.iconURL()}`,
                        })
                        .setDescription(
                            `**Created By:** ${invite.inviter}\n**Expires:** ${expiry}\n**Location:** ${invite.channel}\n**Invite:** https://discord.gg/${invite.code}`
                        )
                        .setFooter({ text: `ID: ${invite.code}` })
                        .setTimestamp();

                    // Send the embed to the logging channel
                    chn.send({ embeds: [embed] });
                }
            }
        }
    }
}
