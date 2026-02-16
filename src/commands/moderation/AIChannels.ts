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
    type Guild,
    MessageFlags,
    PermissionsBitField,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import { ButtonComponent, Discord, SelectMenuComponent, Slash } from 'discordx';
import {
    clearAIAllowedChannels,
    getAIAllowedChannels,
    isAIGuildEnabled,
    isAIStaff,
    setAIAllowedChannels,
} from '../../utils/ai/index.js';

const AI_CHANNEL_SELECT_ID = 'cfg:ai:channels';
const AI_CHANNEL_CLEAR_ID = 'cfg:ai:channels:clear';

@Discord()
@Category('Moderation')
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

        const payload = await this.buildPayload(interaction.guild.id, interaction.guild);
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

        if (interaction.values.length === 0) {
            await interaction.deferUpdate();
            return;
        }

        const me = interaction.guild.members.me;
        const canSend = me
            ? interaction.values.filter((id) => {
                  const ch = interaction.guild!.channels.cache.get(id);
                  return ch && me.permissionsIn(ch).has(PermissionsBitField.Flags.SendMessages);
              })
            : [];

        const skipped = interaction.values.length - canSend.length;
        await setAIAllowedChannels(interaction.guild.id, canSend);
        const notice =
            skipped > 0
                ? `\n> ⚠️ ${skipped} channel(s) were not added because the bot cannot send messages there.`
                : '';
        const payload = await this.buildPayload(interaction.guild.id, interaction.guild, notice);
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
        const payload = await this.buildPayload(interaction.guild.id, interaction.guild);
        await interaction.update(payload);
    }

    private async buildPayload(
        guildId: string,
        guild: Guild | null,
        notice = ''
    ): Promise<{ components: [ContainerBuilder] }> {
        const [channels, enabled] = await Promise.all([
            getAIAllowedChannels(guildId),
            isAIGuildEnabled(guildId),
        ]);

        const me = guild?.members.me;
        const defaultChannels =
            me && channels.length > 0
                ? channels.filter((id) => {
                      const ch = guild.channels.cache.get(id);
                      return ch && me.permissionsIn(ch).has(PermissionsBitField.Flags.SendMessages);
                  })
                : channels;

        const statusText =
            channels.length === 0
                ? [
                      `> Global AI: ${enabled ? '`Enabled` ✅' : '`Disabled` ⛔'} (toggle in \`/config\`)`,
                      '> Mode: `All channels allowed`',
                      '> Select one or more channels below to enable allow-list mode.',
                  ].join('\n') + notice
                : [
                      `> Global AI: ${enabled ? '`Enabled` ✅' : '`Disabled` ⛔'} (toggle in \`/config\`)`,
                      '> Mode: `Allow-list enabled`',
                      `> Allowed channels (${channels.length}): ${channels.map((id) => `<#${id}>`).join(', ')}`,
                  ].join('\n') + notice;

        const container = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('# AI Channel Gating'))
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(statusText))
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addActionRowComponents((row) =>
                row.addComponents(
                    new ChannelSelectMenuBuilder()
                        .setCustomId(AI_CHANNEL_SELECT_ID)
                        .setPlaceholder('Select AI-allowed channels')
                        .setMinValues(1)
                        .setMaxValues(25)
                        .setDefaultChannels(...defaultChannels.slice(0, 25))
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
