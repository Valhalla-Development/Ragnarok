import { Category } from '@discordx/utilities';
import {
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonStyle,
    type CommandInteraction,
    ContainerBuilder,
    type GuildMember,
    type GuildMemberRoleManager,
    MessageFlags,
    PermissionsBitField,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import {
    ButtonComponent,
    type Client,
    Discord,
    Guard,
    Slash,
    SlashChoice,
    SlashOption,
} from 'discordx';
import { BotHasPerm } from '../../guards/BotHasPerm.js';
import { RagnarokComponent } from '../../utils/Util.js';

type DeleteTimeKey =
    | 'Previous Hour'
    | 'Previous 6 Hours'
    | 'Previous 12 Hours'
    | 'Previous 24 Hours'
    | 'Previous 3 Days'
    | 'Previous 7 Days';

@Discord()
@Category('Moderation')
export class Ban {
    private buildBanContainer(params: {
        guildName: string;
        target: GuildMember;
        moderator: string;
        reason: string;
        deleteMessagesLabel: string;
        unbanCustomId: string;
        unbanDisabled?: boolean;
        statusLine?: string;
    }): ContainerBuilder {
        const header = new TextDisplayBuilder().setContent('# 🔨 Member Banned');

        const details = new TextDisplayBuilder().setContent(
            [
                `> **User:** ${params.target} (\`${params.target.user.tag}\`)`,
                `> **User ID:** \`${params.target.id}\``,
                `> **Server:** **${params.guildName}**`,
                `> **Moderator:** ${params.moderator}`,
                `> **Delete Messages:** \`${params.deleteMessagesLabel}\``,
                `> **Reason:** ${params.reason ? `\`${params.reason}\`` : '`No reason given.`'}`,
                params.statusLine ? `> **Status:** ${params.statusLine}` : '',
            ]
                .filter(Boolean)
                .join('\n')
        );

        const unbanButton = new ButtonBuilder()
            .setCustomId(params.unbanCustomId)
            .setStyle(ButtonStyle.Danger)
            .setLabel('Unban')
            .setDisabled(Boolean(params.unbanDisabled));

        return new ContainerBuilder()
            .addTextDisplayComponents(header)
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(details)
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addActionRowComponents((row) => row.addComponents(unbanButton));
    }

    private buildBanDmContainer(params: {
        guildName: string;
        moderator: string;
        reason: string;
    }): ContainerBuilder {
        const header = new TextDisplayBuilder().setContent('# 🚫 You were banned');
        const body = new TextDisplayBuilder().setContent(
            [
                `> **Server:** **${params.guildName}**`,
                `> **Reason:** ${params.reason ? `\`${params.reason}\`` : '`No reason given.`'}`,
                `> **Moderator:** ${params.moderator}`,
            ].join('\n')
        );

        return new ContainerBuilder()
            .addTextDisplayComponents(header)
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(body);
    }

    /**
     * Ban a user from the server.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param user - User to ban
     * @param reason - Reason for the ban (optional)
     * @param deleteMessages - How many messages to delete from the user (optional)
     */
    @Slash({
        description: 'Ban a user from the server.',
        defaultMemberPermissions: [PermissionsBitField.Flags.BanMembers],
    })
    @Guard(BotHasPerm([PermissionsBitField.Flags.BanMembers]))
    async ban(
        @SlashOption({
            description: 'Specify the user to ban.',
            name: 'user',
            required: true,
            type: ApplicationCommandOptionType.User,
        })
        user: GuildMember,
        @SlashOption({
            description: 'Provide a reason for the ban.',
            name: 'reason',
            type: ApplicationCommandOptionType.String,
        })
        reason: string,
        @SlashChoice({ name: 'Previous Hour', value: 'delete1h' })
        @SlashChoice({ name: 'Previous 6 Hours', value: 'delete6h' })
        @SlashChoice({ name: 'Previous 12 Hours', value: 'delete12h' })
        @SlashChoice({ name: 'Previous 24 Hours', value: 'delete24h' })
        @SlashChoice({ name: 'Previous 3 Days', value: 'delete3d' })
        @SlashChoice({ name: 'Previous 7 Days', value: 'delete7d' })
        @SlashOption({
            description: 'Specify the number of messages to delete from the user.',
            name: 'delete_messages',
            type: ApplicationCommandOptionType.String,
        })
        deleteMessages: DeleteTimeKey,
        interaction: CommandInteraction,
        client: Client
    ): Promise<void> {
        const deleteTime = {
            'Previous Hour': 3600,
            'Previous 6 Hours': 21_600,
            'Previous 12 Hours': 43_200,
            'Previous 24 Hours': 86_400,
            'Previous 3 Days': 259_200,
            'Previous 7 Days': 604_800,
        };

        const deleteMessage = deleteTime[deleteMessages || 'Previous Hour'];
        const deleteMessagesLabel = deleteMessages || 'Previous Hour';
        const banReason = reason || 'No reason given.';

        // If user id = message id
        if (user.id === interaction.user.id) {
            await RagnarokComponent(interaction, 'Error', 'You cannot ban yourself!', true);
            return;
        }

        // Check if the user has a role that is higher than the message author
        const memberRoles = interaction.member!.roles as GuildMemberRoleManager;
        if (user.roles.highest.position >= memberRoles.highest.position) {
            await RagnarokComponent(
                interaction,
                'Error',
                'You cannot ban someone with a higher role than yourself!',
                true
            );
            return;
        }

        // Check if user is bannable
        if (
            user.permissions.has(PermissionsBitField.Flags.ManageGuild) ||
            user.permissions.has(PermissionsBitField.Flags.Administrator) ||
            !user.bannable
        ) {
            await RagnarokComponent(interaction, 'Error', `You cannot ban ${user}`, true);
            return;
        }

        // Check if user is the bot
        if (user.id === client.user?.id) {
            await RagnarokComponent(
                interaction,
                'Error',
                'You cannot ban me. :slight_frown:',
                true
            );
            return;
        }

        // Ban the user
        try {
            await interaction.guild!.members.ban(user, {
                deleteMessageSeconds: deleteMessage,
                reason: banReason,
            });
        } catch {
            await RagnarokComponent(
                interaction,
                'Error',
                'Ban failed. Check role hierarchy and my Ban Members permission.',
                true
            );
            return;
        }

        try {
            const dmContainer = this.buildBanDmContainer({
                guildName: interaction.guild!.name,
                moderator: `${interaction.user}`,
                reason: banReason,
            });
            await user.send({ components: [dmContainer], flags: MessageFlags.IsComponentsV2 });
        } catch {
            // Do nothing
        }

        const unbanCustomId = `ban:unban:${interaction.guild!.id}:${user.id}`;
        const container = this.buildBanContainer({
            guildName: interaction.guild!.name,
            target: user,
            moderator: `${interaction.user}`,
            reason: banReason,
            deleteMessagesLabel,
            unbanCustomId,
        });

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    }

    @ButtonComponent({ id: /^ban:unban:\d+:\d+$/ })
    async onUnban(interaction: import('discord.js').ButtonInteraction): Promise<void> {
        const parts = interaction.customId.split(':');
        // ban:unban:<guildId>:<userId>
        const guildId = parts[2];
        const userId = parts[3];

        if (!(interaction.guild && guildId && userId) || interaction.guild.id !== guildId) {
            await RagnarokComponent(interaction, 'Error', 'Invalid guild for this action.', true);
            return;
        }

        if (!interaction.memberPermissions?.has(PermissionsBitField.Flags.BanMembers)) {
            await RagnarokComponent(
                interaction,
                'Error',
                'You require the `Ban Members` permission to unban users.',
                true
            );
            return;
        }

        try {
            await interaction.guild.members.unban(userId);
        } catch {
            await RagnarokComponent(
                interaction,
                'Error',
                'Unban failed. The user may already be unbanned, or I lack permission.',
                true
            );
            return;
        }

        // Disable the button and update the message to show completion
        // Rebuild a simple "unbanned" container
        const header = new TextDisplayBuilder().setContent('# ✅ Member Unbanned');
        const body = new TextDisplayBuilder().setContent(
            [
                `> **User ID:** \`${userId}\``,
                `> **Moderator:** ${interaction.user}`,
                '> **Status:** `Unbanned`',
            ].join('\n')
        );

        const disabledButton = new ButtonBuilder()
            .setCustomId(interaction.customId)
            .setStyle(ButtonStyle.Secondary)
            .setLabel('Unbanned')
            .setDisabled(true);

        const container = new ContainerBuilder()
            .addTextDisplayComponents(header)
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(body)
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addActionRowComponents((row) => row.addComponents(disabledButton));

        await interaction.update({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}
