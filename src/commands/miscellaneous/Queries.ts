import { Category } from '@discordx/utilities';
import {
    type AnySelectMenuInteraction,
    ApplicationCommandOptionType,
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    type CommandInteraction,
    ContainerBuilder,
    MessageFlags,
    SeparatorSpacingSize,
    StringSelectMenuBuilder,
    TextDisplayBuilder,
    type User,
} from 'discord.js';
import { ButtonComponent, Discord, SelectMenuComponent, Slash, SlashOption } from 'discordx';
import { config } from '../../config/Config.js';
import {
    getAIUserPersona,
    getAiUserData,
    getEffectivePersonaId,
    isAIAdmin,
    isAIStaff,
    resetAICooldown,
    resetAIHistory,
    setAIBlacklist,
    setAIUserPersona,
    setAIWhitelist,
} from '../../utils/ai/Index.js';
import { personas } from '../../utils/ai/personas/Index.js';
import { RagnarokComponent } from '../../utils/Util.js';

const RESET_BUTTON_ID = 'aiq:reset';
const RESET_HISTORY_BUTTON_ID = 'aiq:reset-history';
const BLACKLIST_BUTTON_ID = 'aiq:blacklist';
const WHITELIST_BUTTON_ID = 'aiq:whitelist';
const AIQ_PERSONA_SELECT_ID = 'aiq:persona';
const USE_SERVER_DEFAULT_VALUE = 'server_default';
const PERSONA_NOTICE_TTL_MS = 4000;

function personaIdToLabel(id: string): string {
    return id.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase());
}

@Discord()
@Category('Miscellaneous')
export class Queries {
    private readonly targetByMessage = new Map<string, string>();
    private readonly ownerByMessage = new Map<string, string>();
    private readonly staffViewByMessage = new Map<string, boolean>();

    private async buildPayload(
        target: User,
        invokerId: string,
        isStaffView: boolean,
        actionNotice?: string,
        options?: { guildId?: string | null; personaNotice?: string }
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

        if (options !== undefined) {
            const personaId = await getEffectivePersonaId(invokerId, options.guildId ?? null);
            const userPersona = await getAIUserPersona(invokerId);
            const persona = personas[personaId];
            const label = persona ? personaIdToLabel(persona.id) : personaIdToLabel(personaId);
            const personaLines = [
                `> **AI Persona:** ${label}`,
                '> Choose a persona or "Use server/default" to follow the server default.',
                '> **⚠️** Changing your persona will automatically clear your AI history.',
            ];
            if (options.personaNotice) {
                personaLines.push(`> ${options.personaNotice}`);
            }
            const personaOptionsList = Object.entries(personas)
                .map(([value, p]) => ({
                    label: personaIdToLabel(p.id),
                    value,
                    description: p.description,
                    default: value === personaId && userPersona !== null,
                }))
                .sort((a, b) => a.label.localeCompare(b.label));
            container
                .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(personaLines.join('\n'))
                )
                .addActionRowComponents((row) =>
                    row.addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId(AIQ_PERSONA_SELECT_ID)
                            .setPlaceholder('Choose persona…')
                            .setMinValues(1)
                            .setMaxValues(1)
                            .addOptions(
                                {
                                    label: 'Use server/default',
                                    value: USE_SERVER_DEFAULT_VALUE,
                                    description: "Follow this server's default or global default",
                                    default: userPersona === null,
                                },
                                ...personaOptionsList
                            )
                    )
                );
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
        const isSelfView = target.id === interaction.user.id;
        const guildId = interaction.guild?.id ?? null;
        const payload = await this.buildPayload(
            target,
            interaction.user.id,
            isStaffView,
            undefined,
            isSelfView ? { guildId } : undefined
        );

        if (!isStaffView) {
            await interaction.reply({
                ...payload,
                flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
            });
            const reply = await interaction.fetchReply();
            this.ownerByMessage.set(reply.id, interaction.user.id);
            this.targetByMessage.set(reply.id, target.id);
            this.staffViewByMessage.set(reply.id, false);
            return;
        }

        await interaction.reply({
            ...payload,
            flags: MessageFlags.IsComponentsV2,
        });
        const reply = await interaction.fetchReply();
        this.ownerByMessage.set(reply.id, interaction.user.id);
        this.targetByMessage.set(reply.id, target.id);
        this.staffViewByMessage.set(reply.id, isStaffView);
    }

    @SelectMenuComponent({ id: AIQ_PERSONA_SELECT_ID })
    async onPersonaSelect(interaction: AnySelectMenuInteraction): Promise<void> {
        if (!interaction.isStringSelectMenu()) {
            return;
        }
        const messageId = interaction.message.id;
        const targetId = this.targetByMessage.get(messageId);
        const ownerId = this.ownerByMessage.get(messageId);
        const isStaffView = this.staffViewByMessage.get(messageId) ?? false;
        if (!(targetId && ownerId)) {
            return;
        }
        if (targetId !== interaction.user.id) {
            await interaction.reply({
                content: 'Only the user whose stats are shown can change their persona here.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }
        const [value] = interaction.values;
        if (value === USE_SERVER_DEFAULT_VALUE) {
            await setAIUserPersona(interaction.user.id, null);
        } else if (value && personas[value]) {
            await setAIUserPersona(interaction.user.id, value);
        } else {
            await interaction.deferUpdate();
            return;
        }
        await resetAIHistory(interaction.user.id);
        const guildId = interaction.guild?.id ?? null;
        const notice =
            value === USE_SERVER_DEFAULT_VALUE
                ? "✅ Now using server's default. Your AI history was cleared."
                : '✅ Preference saved. Your AI history was cleared.';
        const target = await interaction.client.users.fetch(targetId);
        const payload = await this.buildPayload(target, ownerId, isStaffView, undefined, {
            guildId,
            personaNotice: notice,
        });
        await interaction.update({
            ...payload,
            flags: MessageFlags.IsComponentsV2,
        });
        setTimeout(async () => {
            try {
                const clean = await this.buildPayload(target, ownerId, isStaffView, undefined, {
                    guildId,
                });
                await interaction.editReply({
                    ...clean,
                    flags: MessageFlags.IsComponentsV2,
                });
            } catch {
                // Ignore edit failures (e.g. token expired).
            }
        }, PERSONA_NOTICE_TTL_MS);
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
