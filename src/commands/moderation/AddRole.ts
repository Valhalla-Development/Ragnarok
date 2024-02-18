import {
    Client, Discord, Slash, SlashOption,
} from 'discordx';
import {
    ApplicationCommandOptionType,
    CommandInteraction,
    EmbedBuilder,
    GuildMember,
    GuildMemberRoleManager,
    PermissionsBitField,
    Role,
} from 'discord.js';
import { Category } from '@discordx/utilities';
import { color } from '../../utils/Util.js';

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
            const embed = new EmbedBuilder()
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .addFields({
                    name: `**${client.user?.username} - Add Role**`,
                    value: '**◎ Error:** You cannot give yourself a role!',
                });
            await interaction.reply({ ephemeral: true, embeds: [embed] });
            return;
        }

        try {
            const memberRoles = interaction.member!.roles as GuildMemberRoleManager;

            if (role.position >= memberRoles.highest.position) {
                const embed = new EmbedBuilder()
                    .setColor(color(interaction.guild!.members.me!.displayHexColor))
                    .addFields({
                        name: `**${client.user?.username} - Add Role**`,
                        value: '**◎ Error:** You cannot give a user a role that is equal or greater than your own!',
                    });
                await interaction.reply({ ephemeral: true, embeds: [embed] });
                return;
            }

            // Check if the user already has the role
            if (targetMember.roles.cache.has(role.id)) {
                const embed = new EmbedBuilder()
                    .setColor(color(interaction.guild!.members.me!.displayHexColor))
                    .addFields({
                        name: `**${client.user?.username} - Add Role**`,
                        value: `**◎ Error:** ${targetMember} already has the role: ${role}`,
                    });
                await interaction.reply({ ephemeral: true, embeds: [embed] });
                return;
            }

            await targetMember.roles.add(role);

            const embed = new EmbedBuilder()
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .addFields({
                    name: `**${client.user?.username} - Add Role**`,
                    value: `**◎ Success:** I have added the ${role} role to ${targetMember}`,
                });
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error adding role:', error);
            const embed = new EmbedBuilder()
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .addFields({ name: `**${client.user?.username} - Add Role**`, value: '**◎ Error:** An error occurred.' });
            await interaction.reply({ ephemeral: true, embeds: [embed] });
        }
    }
}
