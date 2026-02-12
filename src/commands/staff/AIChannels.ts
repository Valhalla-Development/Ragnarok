import { Category } from '@discordx/utilities';
import {
    type AnySelectMenuInteraction,
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    ChannelType,
    type CommandInteraction,
    ContainerBuilder,
    MessageFlags,
    PermissionsBitField,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import { ButtonComponent, Discord, SelectMenuComponent, Slash } from 'discordx';
import {
    clearAIAllowedChannels,
    getAIAllowedChannels,
    isAIStaff,
    toggleAIAllowedChannel,
} from '../../utils/ai/OpenRouter.js';

const AI_CHANNEL_SELECT_ID = 'cfg:ai:channels';
const AI_CHANNEL_CLEAR_ID = 'cfg:ai:channels:clear';

@Discord()
@Category('Staff')
export class AIChannels {
    @Slash({
        description: 'Configure channels where AI is allowed.',
        defaultMemberPermissions: [PermissionsBitField.Flags.ManageGuild],
    })
    async aichannels(interaction: CommandInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }

        const roleIds =
            interaction.member &&
            'roles' in interaction.member &&
            'cache' in interaction.member.roles
                ? Array.from(interaction.member.roles.cache.keys())
                : [];

        if (!isAIStaff(roleIds, interaction.user.id)) {
            await interaction.reply({
                content: '⚠️ Access denied. Staff role or AI admin required.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const payload = await this.buildPayload(interaction.guild.id);
        await interaction.reply({
            ...payload,
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
            allowedMentions: { parse: [] },
        });
    }

    @SelectMenuComponent({ id: AI_CHANNEL_SELECT_ID })
    async onChannelSelect(interaction: AnySelectMenuInteraction): Promise<void> {
        if (!(interaction.guild && interaction.isChannelSelectMenu())) {
            return;
        }
        if (interaction.user.id !== interaction.message.interaction?.user.id) {
            await interaction.reply({
                content: 'Only the command executor can change AI channel settings.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        const channelId = interaction.values[0];
        if (!channelId) {
            await interaction.deferUpdate();
            return;
        }

        await toggleAIAllowedChannel(interaction.guild.id, channelId);
        const payload = await this.buildPayload(interaction.guild.id);
        await interaction.update(payload);
    }

    @ButtonComponent({ id: AI_CHANNEL_CLEAR_ID })
    async onClear(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }
        if (interaction.user.id !== interaction.message.interaction?.user.id) {
            await interaction.reply({
                content: 'Only the command executor can change AI channel settings.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }

        await clearAIAllowedChannels(interaction.guild.id);
        const payload = await this.buildPayload(interaction.guild.id);
        await interaction.update(payload);
    }

    private async buildPayload(guildId: string): Promise<{ components: [ContainerBuilder] }> {
        const channels = await getAIAllowedChannels(guildId);
        const statusText =
            channels.length === 0
                ? [
                      '> Mode: `All channels allowed`',
                      '> Select channels below to switch into allow-list mode.',
                  ].join('\n')
                : [
                      '> Mode: `Allow-list enabled`',
                      `> Allowed channels: ${channels.map((id) => `<#${id}>`).join(', ')}`,
                  ].join('\n');

        const container = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('# AI Channel Gating'))
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(statusText))
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addActionRowComponents((row) =>
                row.addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId(AI_CHANNEL_SELECT_ID)
                        .setPlaceholder('Toggle an AI-allowed channel')
                        .addChannelTypes(ChannelType.GuildText)
                )
            )
            .addActionRowComponents((row) =>
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(AI_CHANNEL_CLEAR_ID)
                        .setLabel('Allow All Channels')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(channels.length === 0)
                )
            );

        return { components: [container] };
    }
}
