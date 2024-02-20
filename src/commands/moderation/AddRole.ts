import {
    Client, Discord, Guard, Slash, SlashOption,
} from 'discordx';
import {
    ApplicationCommandOptionType, CommandInteraction, GuildMember, GuildMemberRoleManager, PermissionsBitField, Role,
} from 'discord.js';
import { Category } from '@discordx/utilities';
import { RagnarokEmbed } from '../../utils/Util.js';
import { BotHasPerm } from '../../guards/BotHasPerm.js';

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
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        const targetMember = user || interaction.member;

        if (targetMember.id === interaction.member!.user.id) {
            await RagnarokEmbed(client, interaction, 'Error', 'You cannot give yourself a role!');
            return;
        }

        try {
            const memberRoles = interaction.member!.roles as GuildMemberRoleManager;

            if (role.position >= memberRoles.highest.position) {
                await RagnarokEmbed(client, interaction, 'Error', 'You cannot give a user a role that is equal or greater than your own!', true);
                return;
            }

            // Check if the user already has the role
            if (targetMember.roles.cache.has(role.id)) {
                await RagnarokEmbed(client, interaction, 'Error', `${targetMember} already has the role: ${role}`, true);
                return;
            }

            await targetMember.roles.add(role);

            await RagnarokEmbed(client, interaction, 'Success', `I have added the ${role} role to ${targetMember}`);
        } catch (error) {
            console.error('Error adding role:', error);

            await RagnarokEmbed(client, interaction, 'Error', `An error occurred, ${error}`, true);
        }
    }
}
