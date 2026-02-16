import { Category } from '@discordx/utilities';
import {
    ApplicationCommandOptionType,
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    type CommandInteraction,
    ContainerBuilder,
    MessageFlags,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    type User,
} from 'discord.js';
import { ButtonComponent, Discord, Slash, SlashOption } from 'discordx';
import { config } from '../../config/Config.js';
import {
    getAiUserData,
    isAIAdmin,
    isAIStaff,
    resetAICooldown,
    resetAIHistory,
    setAIBlacklist,
    setAIWhitelist,
} from '../../utils/ai/Index.js';
import { RagnarokComponent } from '../../utils/Util.js';

const RESET_BUTTON_ID = 'aiq:reset';
const RESET_HISTORY_BUTTON_ID = 'aiq:reset-history';
const BLACKLIST_BUTTON_ID = 'aiq:blacklist';
const WHITELIST_BUTTON_ID = 'aiq:whitelist';

@Discord()
@Category('Miscellaneous')
export class Queries {
    private readonly targetByMessage = new Map<string, string>();

    private readonly ownerByMessage = new Map<string, string>();

    private async buildPayload(
        target: User,
        invokerId: string,
        isStaffView: boolean,
        actionNotice?: string
    ) {
        const data = await getAiUserData(target.id);
        if (!data) {
            const container = new ContainerBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent('# 🤖 AI Query Checker')
                )
                .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(`> ⚠️ No AI query data found for ${target}.`)
                );
            return {
                components: [container],
                allowedMentions: { parse: [] as never[] },
            };
        }

        const maxLimit = Math.max(1, Number(config.MAX_AI_QUERIES_LIMIT || 30));
        const isAdminUser = isAIAdmin(target.id);
        const usedQueries = maxLimit - data.queriesRemaining;
        const privilege = isAdminUser ? '👑 AI Admin' : '👤 Standard User';

        const details = [
            `## 👤 ${target.displayName}`,
            `> **Privilege:** ${privilege}`,
            '',
            `- **Total Queries:** \`${data.totalQueries.toLocaleString()}\``,
            isAdminUser
                ? '- **Queries Used:** `Unlimited (Admin Bypass)`'
                : `- **Queries Used:** \`${usedQueries}/${maxLimit}\``,
            isAdminUser
                ? '- **Queries Remaining:** `∞`'
                : `- **Queries Remaining:** \`${data.queriesRemaining}\``,
        ];

        if (!isAdminUser) {
            const resetAt =
                data.expiration > 1 ? `<t:${Math.floor(data.expiration / 1000)}:R>` : 'N/A';
            const quotaProfile = data.blacklisted
                ? '⛔ Blacklisted'
                : data.whitelisted
                  ? '✅ Whitelisted'
                  : '🟡 Standard';
            details.splice(2, 0, `> **Quota Profile:** ${quotaProfile}`);
            details.push(`- **Cooldown Reset:** ${resetAt}`);
        }

        const container = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('# 🤖 AI Query Checker'))
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(details.join('\n')));

        if (actionNotice) {
            container
                .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`> ${actionNotice}`));
        }

        if (!isStaffView) {
            container
                .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
                .addActionRowComponents((row) =>
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(RESET_HISTORY_BUTTON_ID)
                            .setLabel('Reset History')
                            .setStyle(ButtonStyle.Secondary)
                            .setEmoji('🧹')
                    )
                );

            return {
                components: [container],
                allowedMentions: { parse: [] as never[] },
            };
        }

        const resetHistory = new ButtonBuilder()
            .setCustomId(RESET_HISTORY_BUTTON_ID)
            .setLabel('Reset History')
            .setStyle(ButtonStyle.Secondary)
            .setEmoji('🧹');
        const actionButtons = [resetHistory];

        if (!isAdminUser) {
            actionButtons.unshift(
                new ButtonBuilder()
                    .setCustomId(RESET_BUTTON_ID)
                    .setLabel('Reset Cooldown')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji('♻️')
            );
            actionButtons.push(
                new ButtonBuilder()
                    .setCustomId(BLACKLIST_BUTTON_ID)
                    .setLabel(data.blacklisted ? 'Unblacklist' : 'Blacklist')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(data.blacklisted ? '✅' : '⛔')
            );
            actionButtons.push(
                new ButtonBuilder()
                    .setCustomId(WHITELIST_BUTTON_ID)
                    .setLabel(data.whitelisted ? 'Unwhitelist' : 'Whitelist')
                    .setStyle(ButtonStyle.Secondary)
                    .setEmoji(data.whitelisted ? '✅' : '⭐')
                    .setDisabled(!isAIAdmin(invokerId))
            );
        }

        container
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addActionRowComponents((row) => row.addComponents(...actionButtons));

        return {
            components: [container],
            allowedMentions: { parse: [] as never[] },
        };
    }

    private async canManage(
        interaction: ButtonInteraction
    ): Promise<{ targetId: string; ownerId: string } | null> {
        const messageId = interaction.message.id;
        const ownerId = this.ownerByMessage.get(messageId);
        const targetId = this.targetByMessage.get(messageId);
        if (!(ownerId && targetId)) {
            return null;
        }
        if (interaction.user.id !== ownerId) {
            await interaction.reply({
                content: 'Only the command executor can use these buttons.',
                flags: MessageFlags.Ephemeral,
                allowedMentions: { parse: [] },
            });
            return null;
        }
        return { targetId, ownerId };
    }

    private async updateWithNotice(
        interaction: ButtonInteraction,
        target: User,
        ownerId: string,
        notice: string
    ): Promise<void> {
        const withNotice = await this.buildPayload(target, ownerId, true, notice);
        await interaction.update({
            ...withNotice,
            flags: MessageFlags.IsComponentsV2,
        });

        setTimeout(async () => {
            try {
                const clean = await this.buildPayload(target, ownerId, true);
                await interaction.message.edit({
                    ...clean,
                    flags: MessageFlags.IsComponentsV2,
                });
            } catch {
                // Ignore message edit failures (deleted/expired interaction context).
            }
        }, 4000);
    }

    @Slash({ description: 'Check AI query usage for yourself or another user.' })
    async queries(
        @SlashOption({
            description: 'Optional user to inspect',
            name: 'user',
            required: false,
            type: ApplicationCommandOptionType.User,
        })
        targetUser: User | undefined,
        interaction: CommandInteraction
    ): Promise<void> {
        const roleIds =
            interaction.member &&
            'roles' in interaction.member &&
            'cache' in interaction.member.roles
                ? Array.from(interaction.member.roles.cache.keys())
                : [];

        const target = targetUser ?? interaction.user;
        const canInspectOthers =
            target.id === interaction.user.id || isAIStaff(roleIds, interaction.user.id);

        if (!canInspectOthers) {
            await RagnarokComponent(
                interaction,
                'Error',
                'You can only inspect your own AI query stats.',
                true
            );
            return;
        }

        const isStaffView = isAIStaff(roleIds, interaction.user.id) && interaction.member !== null;
        const payload = await this.buildPayload(target, interaction.user.id, isStaffView);

        if (!isStaffView) {
            await interaction.reply({
                ...payload,
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
            });
            const reply = await interaction.fetchReply();
            this.ownerByMessage.set(reply.id, interaction.user.id);
            this.targetByMessage.set(reply.id, target.id);
            return;
        }

        await interaction.reply({
            ...payload,
            flags: MessageFlags.IsComponentsV2,
        });
        const reply = await interaction.fetchReply();
        this.ownerByMessage.set(reply.id, interaction.user.id);
        this.targetByMessage.set(reply.id, target.id);
    }

    @ButtonComponent({ id: RESET_BUTTON_ID })
    async onReset(interaction: ButtonInteraction): Promise<void> {
        const state = await this.canManage(interaction);
        if (!state) {
            return;
        }

        const { targetId, ownerId } = state;
        await resetAICooldown(targetId);
        const target = await interaction.client.users.fetch(targetId);
        await this.updateWithNotice(interaction, target, ownerId, '✅ Cooldown reset.');
    }

    @ButtonComponent({ id: BLACKLIST_BUTTON_ID })
    async onBlacklist(interaction: ButtonInteraction): Promise<void> {
        const state = await this.canManage(interaction);
        if (!state) {
            return;
        }
        const { targetId, ownerId } = state;
        const existing = await getAiUserData(targetId);
        const nextBlacklisted = !(existing?.blacklisted ?? false);
        await setAIBlacklist(targetId, nextBlacklisted);
        const target = await interaction.client.users.fetch(targetId);
        await this.updateWithNotice(
            interaction,
            target,
            ownerId,
            nextBlacklisted ? '⛔ User blacklisted from AI.' : '✅ User removed from blacklist.'
        );
    }

    @ButtonComponent({ id: RESET_HISTORY_BUTTON_ID })
    async onResetHistory(interaction: ButtonInteraction): Promise<void> {
        const state = await this.canManage(interaction);
        if (!state) {
            return;
        }

        const { targetId, ownerId } = state;
        await resetAIHistory(targetId);
        const target = await interaction.client.users.fetch(targetId);
        await this.updateWithNotice(interaction, target, ownerId, '🧹 History reset.');
    }

    @ButtonComponent({ id: WHITELIST_BUTTON_ID })
    async onWhitelist(interaction: ButtonInteraction): Promise<void> {
        const state = await this.canManage(interaction);
        if (!state) {
            return;
        }
        const { targetId, ownerId } = state;

        if (!isAIAdmin(ownerId)) {
            await interaction.reply({
                content: 'Only AI admins can toggle whitelist status.',
                flags: MessageFlags.Ephemeral,
                allowedMentions: { parse: [] },
            });
            return;
        }

        const existing = await getAiUserData(targetId);
        const nextWhitelisted = !(existing?.whitelisted ?? false);
        await setAIWhitelist(targetId, nextWhitelisted);
        const target = await interaction.client.users.fetch(targetId);
        await this.updateWithNotice(
            interaction,
            target,
            ownerId,
            nextWhitelisted ? '⭐ User whitelisted for AI.' : '✅ User removed from whitelist.'
        );
    }
}
