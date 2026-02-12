import { ChannelType, Events, MessageFlags, PermissionsBitField } from 'discord.js';
import { type ArgsOf, Discord, On } from 'discordx';
import Logging from '../mongo/Logging.js';
import { RagnarokContainer } from '../utils/Util.js';

/**
 * Discord.js GuildRoleCreate event handler.
 */
@Discord()
export class GuildRoleCreate {
    /**
     * Executes when the GuildRoleCreate event is emitted.
     * @param role
     * @returns void
     */
    @On({ event: Events.GuildRoleCreate })
    async onRoleCreate([role]: ArgsOf<'roleCreate'>) {
        // If logging is enabled, send an embed to the set channel
        const logging = await Logging.findOne({ GuildId: role.guild.id });
        if (logging?.ChannelId) {
            const channelId = logging.ChannelId;
            // Fetch the logging channel
            const chn =
                role.guild?.channels.cache.get(channelId) ??
                (await role.guild?.channels.fetch(channelId));

            // Check if the channel exists, is a text channel, and has the necessary permissions to send messages
            if (
                chn &&
                chn.type === ChannelType.GuildText &&
                chn
                    .permissionsFor(chn.guild.members.me!)
                    .has(PermissionsBitField.Flags.SendMessages)
            ) {
                const container = RagnarokContainer(
                    'Role Created',
                    `${role} - \`@${role.name}\`\n**ID:** \`${role.id}\``
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
