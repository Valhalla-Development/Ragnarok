import { Category } from '@discordx/utilities';
import {
    ApplicationCommandOptionType,
    type CommandInteraction,
    codeBlock,
    type GuildMember,
    type GuildMemberRoleManager,
    PermissionsBitField,
    type Role,
} from 'discord.js';
import { Discord, Guard, Slash, SlashOption } from 'discordx';
import { BotHasPerm } from '../../guards/BotHasPerm.js';
import { RagnarokComponent } from '../../utils/Util.js';

@Discord()
@Category('Moderation')
export class AddRole {
    /**
     * Add a role to a specified user.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param user - The user to add the role to
     * @param role - The role to add to the user
     */
    @Slash({
        description: 'Add a role to a specified user.',
        defaultMemberPermissions: [PermissionsBitField.Flags.ManageRoles],
    })
    @Guard(BotHasPerm([PermissionsBitField.Flags.ManageRoles]))
    async addrole(
        @SlashOption({
            description: 'User to add the role to',
            name: 'user',
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        user: GuildMember,
        @SlashOption({
            description: 'Role to add to the user',
            name: 'role',
            required: true,
            type: ApplicationCommandOptionType.Role,
        })
        role: Role,
        interaction: CommandInteraction
    ): Promise<void> {
        const targetMember = user || interaction.member;

        if (targetMember.id === interaction.member!.user.id) {
            await RagnarokComponent(interaction, 'Error', 'You cannot give yourself a role!', true);
            return;
        }

        try {
            const memberRoles = interaction.member!.roles as GuildMemberRoleManager;

            if (role.position >= memberRoles.highest.position) {
                await RagnarokComponent(
                    interaction,
                    'Error',
                    'You cannot give a user a role that is equal or greater than your own!',
                    true
                );
                return;
            }

            // Check if the user already has the role
            if (targetMember.roles.cache.has(role.id)) {
                await RagnarokComponent(
                    interaction,
                    'Error',
                    `${targetMember} already has the role: ${role}`,
                    true
                );
                return;
            }

            await targetMember.roles.add(role);

            await RagnarokComponent(
                interaction,
                'Success',
                `I have added the ${role} role to ${targetMember}`
            );
        } catch (error) {
            console.error('Error adding role:', error);

            await RagnarokComponent(
                interaction,
                'Error',
                `An error occurred\n${codeBlock('text', `${error}`)}`,
                true
            );
        }
    }
}
