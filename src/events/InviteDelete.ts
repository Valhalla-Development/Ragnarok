import { ChannelType, EmbedBuilder, Events, Guild, PermissionsBitField } from 'discord.js';
import { type ArgsOf, Discord, On } from 'discordx';
import Logging from '../mongo/Logging.js';

/**
 * Discord.js InviteDelete event handler.
 */
@Discord()
export class InviteDelete {
    /**
     * Executes when the InviteDelete event is emitted.
     * @param invite
     * @returns void
     */
    @On({ event: Events.InviteDelete })
    async onInviteDelete([invite]: ArgsOf<'inviteDelete'>) {
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
                    const embed = new EmbedBuilder()
                        .setColor('#FE4611')
                        .setAuthor({
                            name: 'Invite Deleted',
                            iconURL: `${invite.guild!.iconURL()}`,
                        })
                        .setDescription(`**Invite:** https://discord.gg/${invite.code}`)
                        .setFooter({ text: `ID: ${invite.code}` })
                        .setTimestamp();

                    // Send the embed to the logging channel
                    chn.send({ embeds: [embed] });
                }
            }
        }
    }
}
