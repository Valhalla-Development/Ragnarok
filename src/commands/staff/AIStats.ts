import { Category } from '@discordx/utilities';
import {
    type CommandInteraction,
    ContainerBuilder,
    MessageFlags,
    PermissionsBitField,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import { Discord, Slash } from 'discordx';
import {
    getAITopUsers,
    getAITotalQueryCount,
    isAIGuildEnabled,
    isAIStaff,
} from '../../utils/ai/OpenRouter.js';

@Discord()
@Category('Staff')
export class AIStats {
    @Slash({
        description: 'View AI usage statistics.',
        defaultMemberPermissions: [PermissionsBitField.Flags.ManageMessages],
    })
    async aistats(interaction: CommandInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }

        const roleIds =
            interaction.member &&
            'roles' in interaction.member &&
            'cache' in interaction.member.roles
                ? Array.from(interaction.member.roles.cache.keys())
                : [];

        const canView = isAIStaff(roleIds, interaction.user.id) && interaction.member !== null;

        if (!canView) {
            await interaction.reply({
                content: '⚠️ Only AI staff can view usage stats.',
                flags: MessageFlags.Ephemeral,
                allowedMentions: { parse: [] },
            });
            return;
        }

        const [enabled, total, top] = await Promise.all([
            isAIGuildEnabled(interaction.guild.id),
            getAITotalQueryCount(),
            getAITopUsers(10),
        ]);
        if (top.length === 0) {
            await interaction.reply({
                content: 'No AI usage data found yet.',
                flags: MessageFlags.Ephemeral,
                allowedMentions: { parse: [] },
            });
            return;
        }

        const lines = top.map(
            (entry, index) =>
                `\`${index + 1}\` <@${entry.userId}> — \`${entry.totalQueries.toLocaleString()}\``
        );

        const container = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('# 📊 AI Usage Stats'))
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    [
                        `> **Global AI:** ${enabled ? '`Enabled` ✅' : '`Disabled` ⛔'} (toggle in \`/config\`)`,
                        `> **Total Queries:** \`${total.toLocaleString()}\``,
                        '',
                        '## 🏆 Top Users',
                        ...lines,
                    ].join('\n')
                )
            );

        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { parse: [] },
        });
    }
}
