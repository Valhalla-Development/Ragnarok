import {
    ArgsOf, Client, Discord, On,
} from 'discordx';
import { ChannelType, EmbedBuilder, PermissionsBitField } from 'discord.js';
import Logging from '../mongo/Logging.js';

/**
 * Discord.js RoleDelete event handler.
 */
@Discord()
export class RoleDelete {
    /**
     * Executes when the RoleDelete event is emitted.
     * @param guild
     * @param client - The Discord client.
     * @returns void
     */
    @On({ event: 'roleDelete' })
    async onRoleDelete([role]: ArgsOf<'roleDelete'>, client: Client) {
        // If logging is enabled, send an embed to the set channel
        const logging = await Logging.findOne({ GuildId: role.guild.id });
        if (logging) {
            // Fetch the logging channel
            const chn = role.guild?.channels.cache.get(logging.ChannelId) ?? await role.guild?.channels.fetch(logging.ChannelId);

            // Check if the channel exists, is a text channel, and has the necessary permissions to send messages
            if (chn && chn.type === ChannelType.GuildText
                && chn.permissionsFor(chn.guild.members.me!).has(PermissionsBitField.Flags.SendMessages)) {
                // Create an embed with information about the joined member
                const embed = new EmbedBuilder()
                    .setColor('#FE4611')
                    .setAuthor({
                        name: 'Role Deleted',
                        iconURL: `${role.guild.iconURL()}`,
                    })
                    .setDescription(
                        `\`@${role.name}\``,
                    )
                    .setFooter({ text: `ID: ${role.id}` })
                    .setTimestamp();

                // Send the embed to the logging channel
                chn.send({ embeds: [embed] });
            }
        }
    }
}
