import { ChannelType, EmbedBuilder, Events, PermissionsBitField } from 'discord.js';
import { type ArgsOf, Discord, On } from 'discordx';
import Logging from '../mongo/Logging.js';

/**
 * Discord.js GuildRoleDelete event handler.
 */
@Discord()
export class GuildRoleDelete {
    /**
     * Executes when the GuildRoleDelete event is emitted.
     * @param role
     * @returns void
     */
    @On({ event: Events.GuildRoleDelete })
    async onRoleDelete([role]: ArgsOf<'roleDelete'>) {
        // If logging is enabled, send an embed to the set channel
        const logging = await Logging.findOne({ GuildId: role.guild.id });
        if (logging) {
            // Fetch the logging channel
            const chn =
                role.guild?.channels.cache.get(logging.ChannelId) ??
                (await role.guild?.channels.fetch(logging.ChannelId));

            // Check if the channel exists, is a text channel, and has the necessary permissions to send messages
            if (
                chn &&
                chn.type === ChannelType.GuildText &&
                chn
                    .permissionsFor(chn.guild.members.me!)
                    .has(PermissionsBitField.Flags.SendMessages)
            ) {
                // Create an embed with information about the joined member
                const embed = new EmbedBuilder()
                    .setColor('#FE4611')
                    .setAuthor({
                        name: 'Role Deleted',
                        iconURL: `${role.guild.iconURL()}`,
                    })
                    .setDescription(`\`@${role.name}\``)
                    .setFooter({ text: `ID: ${role.id}` })
                    .setTimestamp();

                // Send the embed to the logging channel
                chn.send({ embeds: [embed] });
            }
        }
    }
}
