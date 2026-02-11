import { Category } from '@discordx/utilities';
import {
    ActionRowBuilder,
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    ChannelType,
    type CommandInteraction,
    Events,
    type Message,
    PermissionsBitField,
    type Role,
    type Snowflake,
} from 'discord.js';
import type { ArgsOf } from 'discordx';
import { ButtonComponent, Discord, On, Slash } from 'discordx';
import RoleMenu from '../../mongo/RoleMenu.js';
import { RagnarokComponent } from '../../utils/Util.js';

const ROLEMENU_BUTTON_PREFIX = 'rm:';

@Discord()
@Category('Moderation')
export class RoleMenuCommand {
    @Slash({
        description: 'Post or refresh the self-role menu in this channel',
        defaultMemberPermissions: [PermissionsBitField.Flags.ManageGuild],
    })
    async rolemenu(interaction: CommandInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }

        if (!interaction.channel) {
            return;
        }

        if (interaction.channel.type !== ChannelType.GuildText) {
            return;
        }

        const config = await RoleMenu.findOne({ GuildId: interaction.guild.id });
        const storedRoleIds = (config?.RoleList ?? []) as string[];

        if (storedRoleIds.length === 0) {
            await RagnarokComponent(
                interaction,
                'Error',
                'No role menu roles configured yet. Set them in `/config` first.',
                true
            );
            return;
        }

        const cleanRoles = storedRoleIds
            .map((roleId) => interaction.guild!.roles.cache.get(roleId))
            .filter((role): role is Role => {
                if (!role) {
                    return false;
                }
                return role.position < interaction.guild!.members.me!.roles.highest.position;
            });

        if (cleanRoles.length === 0) {
            await RoleMenu.findOneAndUpdate(
                { GuildId: interaction.guild.id },
                {
                    $set: {
                        RoleList: [],
                        RoleMenuId: { channel: null, message: null },
                    },
                },
                { upsert: true, new: true }
            );
            await RagnarokComponent(
                interaction,
                'Error',
                'Configured roles are missing or above my role hierarchy. Reconfigure valid roles in `/config`.',
                true
            );
            return;
        }

        const cleanRoleIds = cleanRoles.map((role) => role.id);
        if (cleanRoleIds.length !== storedRoleIds.length) {
            await RoleMenu.findOneAndUpdate(
                { GuildId: interaction.guild.id },
                { $set: { RoleList: cleanRoleIds } },
                { upsert: true, new: true }
            );
        }

        const rows = buildRows(cleanRoles);
        const description = 'Use the buttons below to toggle your roles.';

        let posted: Message;
        let actionWord = 'posted';
        const existingChannelId = config?.RoleMenuId?.channel;
        const existingMessageId = config?.RoleMenuId?.message;

        if (existingChannelId && existingMessageId) {
            const existingChannel = await interaction.guild.channels
                .fetch(existingChannelId)
                .catch(() => null);

            if (existingChannel?.isTextBased() && 'messages' in existingChannel) {
                const existingMessage = await existingChannel.messages
                    .fetch(existingMessageId)
                    .catch(() => null);

                if (existingMessage) {
                    posted = await existingMessage.edit({
                        content: `## 🎭 Role Menu\n${description}`,
                        components: rows,
                    });
                    actionWord = 'refreshed';
                } else {
                    posted = await interaction.channel.send({
                        content: `## 🎭 Role Menu\n${description}`,
                        components: rows,
                    });
                }
            } else {
                posted = await interaction.channel.send({
                    content: `## 🎭 Role Menu\n${description}`,
                    components: rows,
                });
            }
        } else {
            posted = await interaction.channel.send({
                content: `## 🎭 Role Menu\n${description}`,
                components: rows,
            });
        }

        await RoleMenu.findOneAndUpdate(
            { GuildId: interaction.guild.id },
            {
                $set: {
                    RoleMenuId: { channel: posted.channelId, message: posted.id },
                    RoleList: cleanRoleIds,
                },
            },
            { upsert: true, new: true }
        );

        await RagnarokComponent(
            interaction,
            'Success',
            `Role menu ${actionWord} in <#${posted.channelId}> with ${cleanRoleIds.length} role option${cleanRoleIds.length > 1 ? 's' : ''}.`,
            true
        );
    }

    @ButtonComponent({ id: new RegExp(`^${ROLEMENU_BUTTON_PREFIX}`) })
    async onRoleMenuToggle(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }

        if (!interaction.member) {
            return;
        }

        if (!interaction.customId.startsWith(ROLEMENU_BUTTON_PREFIX)) {
            return;
        }

        const roleId = interaction.customId.slice(ROLEMENU_BUTTON_PREFIX.length) as Snowflake;
        const role = interaction.guild.roles.cache.get(roleId);
        const member = await interaction.guild.members.fetch(interaction.user.id);
        const botMember = interaction.guild.members.me;
        const config = await RoleMenu.findOne({ GuildId: interaction.guild.id });
        const configuredRoleIds = new Set((config?.RoleList ?? []) as string[]);

        if (!configuredRoleIds.has(roleId)) {
            await RagnarokComponent(
                interaction,
                'Error',
                'This role button is outdated. Ask a moderator to run `/rolemenu` again.',
                true
            );
            return;
        }

        if (!role) {
            await RagnarokComponent(
                interaction,
                'Error',
                'That role no longer exists. Ask a moderator to refresh the role menu.',
                true
            );
            return;
        }
        if (!botMember) {
            return;
        }

        if (
            !botMember.permissions.has(PermissionsBitField.Flags.ManageRoles) ||
            role.position >= botMember.roles.highest.position
        ) {
            await RagnarokComponent(
                interaction,
                'Error',
                'I cannot manage that role right now due to role hierarchy or missing permissions.',
                true
            );
            return;
        }

        if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role.id);
            await RagnarokComponent(interaction, 'Success', `Removed ${role} from you.`, true);
            return;
        }

        await member.roles.add(role.id);
        await RagnarokComponent(interaction, 'Success', `Added ${role} to you.`, true);
    }

    // Defensive cleanup if the role menu message is removed manually.
    @On({ event: Events.MessageDelete })
    async onRoleMenuDelete([message]: ArgsOf<'messageDelete'>): Promise<void> {
        if (!message.guild) {
            return;
        }

        const config = await RoleMenu.findOne({ GuildId: message.guild.id });
        if (!config?.RoleMenuId) {
            return;
        }

        const messageId = config.RoleMenuId.message;
        const channelId = config.RoleMenuId.channel;
        if (!messageId) {
            return;
        }

        if (!channelId) {
            return;
        }

        if (messageId !== message.id || channelId !== message.channelId) {
            return;
        }

        await RoleMenu.findOneAndUpdate(
            { GuildId: message.guild.id },
            { $set: { RoleMenuId: { channel: null, message: null } } },
            { upsert: true, new: true }
        );
    }
}

function buildRows(roles: Role[]): ActionRowBuilder<ButtonBuilder>[] {
    const buttons = roles.map((role) =>
        new ButtonBuilder()
            .setCustomId(`${ROLEMENU_BUTTON_PREFIX}${role.id}`)
            .setLabel(role.name.slice(0, 80))
            .setStyle(ButtonStyle.Secondary)
    );

    const rows: ActionRowBuilder<ButtonBuilder>[] = [];
    for (let index = 0; index < buttons.length; index += 5) {
        rows.push(
            new ActionRowBuilder<ButtonBuilder>().addComponents(...buttons.slice(index, index + 5))
        );
    }
    return rows;
}
