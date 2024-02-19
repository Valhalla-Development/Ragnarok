import { GuardFunction } from 'discordx';
import { CommandInteraction, EmbedBuilder, PermissionsBitField } from 'discord.js';
import { capitalise, color } from '../utils/Util.js';

/**
 * Checks if the bot has the required permissions before executing a command.
 * @param requiredPermissions An array of bigint values representing the required permissions.
 * @returns A GuardFunction to be used as middleware in Discord interactions.
 */
export function BotHasPerm(requiredPermissions: bigint[]): GuardFunction<CommandInteraction> {
    return async (interaction, client, next) => {
        const missingPermissions = requiredPermissions.filter((permission) => !interaction.guild?.members.me?.permissions.has(permission));

        if (missingPermissions.length > 0) {
            const permissionNames = new PermissionsBitField(missingPermissions).toArray();

            const embed = new EmbedBuilder()
                .setColor(color(`${interaction.guild?.members.me?.displayHexColor}`))
                .addFields({
                    name: `**${client.user?.username} - ${capitalise(interaction.command!.name)}**`,
                    value: `**Error:** I lack the following permissions required for this action: \`${permissionNames.join(', ')}\``,
                });
            return interaction.reply({ embeds: [embed], ephemeral: true });
        }

        await next();
    };
}
