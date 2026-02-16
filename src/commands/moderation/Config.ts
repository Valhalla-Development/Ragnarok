import { Category } from '@discordx/utilities';
import {
    type AnySelectMenuInteraction,
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    ChannelSelectMenuBuilder,
    type ChannelSelectMenuInteraction,
    ChannelType,
    type CommandInteraction,
    ContainerBuilder,
    type Guild,
    MessageFlags,
    PermissionsBitField,
    RoleSelectMenuBuilder,
    type RoleSelectMenuInteraction,
    SeparatorSpacingSize,
    StringSelectMenuBuilder,
    TextDisplayBuilder,
} from 'discord.js';
import { ButtonComponent, Discord, SelectMenuComponent, Slash } from 'discordx';
import AdsProtection from '../../mongo/AdsProtection.js';
import AutoRole from '../../mongo/AutoRole.js';
import BirthdayConfig from '../../mongo/BirthdayConfig.js';
import Dad from '../../mongo/Dad.js';
import Logging from '../../mongo/Logging.js';
import RoleMenu from '../../mongo/RoleMenu.js';
import StarBoard from '../../mongo/StarBoard.js';
import Welcome from '../../mongo/Welcome.js';
import {
    clearAIAllowedChannels,
    clearAllAIHistoryForGuild,
    getAIAllowedChannels,
    getAIGuildPersona,
    isAIGuildEnabled,
    setAIAllowedChannels,
    setAIGuildEnabled,
    setAIGuildPersona,
} from '../../utils/ai/Index.js';
import { personas } from '../../utils/ai/personas/Index.js';

type ConfigModule =
    | 'home'
    | 'ai'
    | 'ads'
    | 'autorole'
    | 'birthday'
    | 'dad'
    | 'rolemenu'
    | 'logging'
    | 'starboard'
    | 'welcome';

interface ModuleViewResult {
    title: string;
    lines: string[];
    controls: (
        | StringSelectMenuBuilder
        | ButtonBuilder
        | RoleSelectMenuBuilder
        | ChannelSelectMenuBuilder
    )[];
}

const MODULE_SELECT_ID = 'cfg:module';
const ADS_ENABLE_BUTTON_ID = 'cfg:ads:enable';
const ADS_DISABLE_BUTTON_ID = 'cfg:ads:disable';
const AI_ENABLE_BUTTON_ID = 'cfg:ai:enable';
const AI_DISABLE_BUTTON_ID = 'cfg:ai:disable';
const DAD_ENABLE_BUTTON_ID = 'cfg:dad:enable';
const DAD_DISABLE_BUTTON_ID = 'cfg:dad:disable';
const ROLEMENU_SELECT_ID = 'cfg:rolemenu:roles:string';
const ROLEMENU_CLEAR_BUTTON_ID = 'cfg:rolemenu:clear';
const AUTOROLE_SELECT_ID = 'cfg:autorole:role';
const AUTOROLE_DISABLE_BUTTON_ID = 'cfg:autorole:disable';
const BIRTHDAY_CHANNEL_SELECT_ID = 'cfg:birthday:channel';
const BIRTHDAY_DISABLE_BUTTON_ID = 'cfg:birthday:disable';
const LOGGING_CHANNEL_SELECT_ID = 'cfg:logging:channel';
const LOGGING_DISABLE_BUTTON_ID = 'cfg:logging:disable';
const STARBOARD_CHANNEL_SELECT_ID = 'cfg:starboard:channel';
const STARBOARD_DISABLE_BUTTON_ID = 'cfg:starboard:disable';
const WELCOME_CHANNEL_SELECT_ID = 'cfg:welcome:channel';
const WELCOME_DISABLE_BUTTON_ID = 'cfg:welcome:disable';
const AI_CHANNEL_SELECT_ID = 'cfg:ai:channels';
const AI_CHANNEL_CLEAR_ID = 'cfg:ai:channels:clear';
const AI_PERSONA_SELECT_ID = 'cfg:ai:persona';
const AI_DELETE_ALL_HISTORY_BUTTON_ID = 'cfg:ai:delete-all-history';

const AI_SECTION_NOTICE_TTL_MS = 4000;

interface AISectionNotices {
    status?: string;
    channels?: string;
    persona?: string;
    deleteAllHistory?: string;
}

function personaIdToLabel(id: string): string {
    return id.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase());
}

@Discord()
@Category('Moderation')
export class Config {
    @Slash({
        description: 'Configure server modules',
        defaultMemberPermissions: [PermissionsBitField.Flags.ManageGuild],
    })
    async config(interaction: CommandInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }

        const payload = await this.buildPayload(interaction.guild, 'home');
        await interaction.reply({
            ...payload,
            flags: [MessageFlags.Ephemeral, MessageFlags.IsComponentsV2],
        });
    }

    @SelectMenuComponent({ id: MODULE_SELECT_ID })
    async onModuleSelect(interaction: AnySelectMenuInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }
        if (!interaction.isStringSelectMenu()) {
            return;
        }
        const selected = interaction.values[0] as ConfigModule | undefined;
        if (!selected) {
            return;
        }
        const payload = await this.buildPayload(interaction.guild, selected);
        await interaction.update(payload);
    }

    @ButtonComponent({ id: AI_ENABLE_BUTTON_ID })
    async onAiEnable(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }
        await setAIGuildEnabled(interaction.guild.id, true);
        await this.updateAIWithNotice(interaction, { status: '✅ AI enabled.' });
    }

    @ButtonComponent({ id: AI_DISABLE_BUTTON_ID })
    async onAiDisable(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }
        await setAIGuildEnabled(interaction.guild.id, false);
        await this.updateAIWithNotice(interaction, { status: '✅ AI disabled.' });
    }

    @SelectMenuComponent({ id: AI_CHANNEL_SELECT_ID })
    async onAiChannelSelect(interaction: AnySelectMenuInteraction): Promise<void> {
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
        await setAIAllowedChannels(interaction.guild.id, canSend);
        await this.updateAIWithNotice(interaction, { channels: '✅ Channels updated.' });
    }

    @ButtonComponent({ id: AI_CHANNEL_CLEAR_ID })
    async onAiChannelClear(interaction: ButtonInteraction): Promise<void> {
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
        await this.updateAIWithNotice(interaction, {
            channels: '✅ Allow-list cleared. All channels allowed.',
        });
    }

    @SelectMenuComponent({ id: AI_PERSONA_SELECT_ID })
    async onAiPersonaSelect(interaction: AnySelectMenuInteraction): Promise<void> {
        if (!(interaction.guild && interaction.isStringSelectMenu())) {
            return;
        }
        if (interaction.user.id !== interaction.message.interaction?.user.id) {
            await interaction.reply({
                content: 'Only the command executor can change the AI persona.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }
        const [value] = interaction.values;
        const validPersona = value && personas[value];
        if (!validPersona) {
            await interaction.deferUpdate();
            return;
        }
        await setAIGuildPersona(interaction.guild.id, value);
        await this.updateAIWithNotice(interaction, { persona: '✅ Default persona updated.' });
    }

    @ButtonComponent({ id: AI_DELETE_ALL_HISTORY_BUTTON_ID })
    async onAiDeleteAllHistory(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }
        if (interaction.user.id !== interaction.message.interaction?.user.id) {
            await interaction.reply({
                content: 'Only the command executor can use this action.',
                flags: MessageFlags.Ephemeral,
            });
            return;
        }
        const deleted = await clearAllAIHistoryForGuild(interaction.guild.id);
        await this.updateAIWithNotice(interaction, {
            deleteAllHistory: `✅ Deleted ${deleted.toLocaleString()} history entries for this server.`,
        });
    }

    @ButtonComponent({ id: ADS_ENABLE_BUTTON_ID })
    async onAdsEnable(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }
        await AdsProtection.findOneAndUpdate(
            { GuildId: interaction.guild.id },
            { $set: { Status: true } },
            { upsert: true, returnDocument: 'after' }
        );
        const payload = await this.buildPayload(interaction.guild, 'ads');
        await interaction.update(payload);
    }

    @ButtonComponent({ id: ADS_DISABLE_BUTTON_ID })
    async onAdsDisable(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }
        await AdsProtection.deleteOne({ GuildId: interaction.guild.id });
        const payload = await this.buildPayload(interaction.guild, 'ads');
        await interaction.update(payload);
    }

    @ButtonComponent({ id: DAD_ENABLE_BUTTON_ID })
    async onDadEnable(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }
        await Dad.findOneAndUpdate(
            { GuildId: interaction.guild.id },
            { $set: { Status: true } },
            { upsert: true, returnDocument: 'after' }
        );
        const payload = await this.buildPayload(interaction.guild, 'dad');
        await interaction.update(payload);
    }

    @ButtonComponent({ id: DAD_DISABLE_BUTTON_ID })
    async onDadDisable(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }
        await Dad.deleteOne({ GuildId: interaction.guild.id });
        const payload = await this.buildPayload(interaction.guild, 'dad');
        await interaction.update(payload);
    }

    @SelectMenuComponent({ id: ROLEMENU_SELECT_ID })
    async onRolemenuSelect(interaction: AnySelectMenuInteraction): Promise<void> {
        const guild = interaction.guild;
        if (!guild) {
            return;
        }
        if (!interaction.isStringSelectMenu()) {
            return;
        }

        const member = await guild.members.fetch(interaction.user.id);
        const botMember = guild.members.me;

        if (!botMember) {
            await interaction.deferUpdate();
            return;
        }

        const selectedRoleIds = [...new Set(interaction.values)];
        const validRoleIds = selectedRoleIds.filter((roleId) => {
            const role = guild.roles.cache.get(roleId);
            if (!role) {
                return false;
            }
            if (role.position >= botMember.roles.highest.position) {
                return false;
            }
            if (
                guild.ownerId !== interaction.user.id &&
                role.position >= member.roles.highest.position
            ) {
                return false;
            }
            return true;
        });

        await RoleMenu.findOneAndUpdate(
            { GuildId: guild.id },
            { $set: { RoleList: validRoleIds.slice(0, 25) } },
            { upsert: true, returnDocument: 'after' }
        );

        const payload = await this.buildPayload(guild, 'rolemenu');
        await interaction.update(payload);
    }

    @ButtonComponent({ id: ROLEMENU_CLEAR_BUTTON_ID })
    async onRolemenuClear(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }

        await RoleMenu.findOneAndUpdate(
            { GuildId: interaction.guild.id },
            { $set: { RoleList: [] } },
            { upsert: true, returnDocument: 'after' }
        );

        const payload = await this.buildPayload(interaction.guild, 'rolemenu');
        await interaction.update(payload);
    }

    @SelectMenuComponent({ id: AUTOROLE_SELECT_ID })
    async onAutoroleSelect(interaction: RoleSelectMenuInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }

        try {
            const roleId = interaction.values[0];
            if (!roleId) {
                await interaction.deferUpdate();
                return;
            }

            const role = interaction.guild.roles.cache.get(roleId);
            if (!role) {
                const payload = await this.buildPayload(interaction.guild, 'autorole');
                await interaction.update(payload);
                return;
            }

            const member = await interaction.guild.members.fetch(interaction.user.id);
            const botMember = interaction.guild.members.me;

            if (!botMember) {
                const payload = await this.buildPayload(interaction.guild, 'autorole');
                await interaction.update(payload);
                return;
            }

            if (role.position >= member.roles.highest.position) {
                const payload = await this.buildPayload(interaction.guild, 'autorole');
                await interaction.update(payload);
                return;
            }

            if (role.position >= botMember.roles.highest.position) {
                const payload = await this.buildPayload(interaction.guild, 'autorole');
                await interaction.update(payload);
                return;
            }

            await AutoRole.findOneAndUpdate(
                { GuildId: interaction.guild.id },
                { $set: { Role: role.id } },
                { upsert: true, returnDocument: 'after' }
            );

            const payload = await this.buildPayload(interaction.guild, 'autorole');
            await interaction.update(payload);
        } catch (error) {
            console.error('AutoRole select failed:', error);
            if (interaction.deferred || interaction.replied) {
                return;
            }
            await interaction.deferUpdate().catch((deferError) => {
                console.error('AutoRole deferUpdate failed:', deferError);
            });
        }
    }

    @ButtonComponent({ id: AUTOROLE_DISABLE_BUTTON_ID })
    async onAutoroleDisable(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }
        await AutoRole.deleteOne({ GuildId: interaction.guild.id });
        const payload = await this.buildPayload(interaction.guild, 'autorole');
        await interaction.update(payload);
    }

    @SelectMenuComponent({ id: BIRTHDAY_CHANNEL_SELECT_ID })
    async onBirthdayChannel(interaction: ChannelSelectMenuInteraction): Promise<void> {
        await this.handleChannelConfigSelection(interaction, 'birthday');
    }

    @ButtonComponent({ id: BIRTHDAY_DISABLE_BUTTON_ID })
    async onBirthdayDisable(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }
        await BirthdayConfig.deleteOne({ GuildId: interaction.guild.id });
        const payload = await this.buildPayload(interaction.guild, 'birthday');
        await interaction.update(payload);
    }

    @SelectMenuComponent({ id: LOGGING_CHANNEL_SELECT_ID })
    async onLoggingChannel(interaction: ChannelSelectMenuInteraction): Promise<void> {
        await this.handleChannelConfigSelection(interaction, 'logging');
    }

    @ButtonComponent({ id: LOGGING_DISABLE_BUTTON_ID })
    async onLoggingDisable(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }
        await Logging.deleteOne({ GuildId: interaction.guild.id });
        const payload = await this.buildPayload(interaction.guild, 'logging');
        await interaction.update(payload);
    }

    @SelectMenuComponent({ id: STARBOARD_CHANNEL_SELECT_ID })
    async onStarboardChannel(interaction: ChannelSelectMenuInteraction): Promise<void> {
        await this.handleChannelConfigSelection(interaction, 'starboard');
    }

    @ButtonComponent({ id: STARBOARD_DISABLE_BUTTON_ID })
    async onStarboardDisable(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }
        await StarBoard.deleteOne({ GuildId: interaction.guild.id });
        const payload = await this.buildPayload(interaction.guild, 'starboard');
        await interaction.update(payload);
    }

    @SelectMenuComponent({ id: WELCOME_CHANNEL_SELECT_ID })
    async onWelcomeChannel(interaction: ChannelSelectMenuInteraction): Promise<void> {
        await this.handleChannelConfigSelection(interaction, 'welcome');
    }

    @ButtonComponent({ id: WELCOME_DISABLE_BUTTON_ID })
    async onWelcomeDisable(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }
        await Welcome.deleteOne({ GuildId: interaction.guild.id });
        const payload = await this.buildPayload(interaction.guild, 'welcome');
        await interaction.update(payload);
    }

    private async handleChannelConfigSelection(
        interaction: ChannelSelectMenuInteraction,
        module: 'birthday' | 'logging' | 'starboard' | 'welcome'
    ): Promise<void> {
        if (!interaction.guild) {
            return;
        }

        const channelId = interaction.values[0];
        if (!channelId) {
            return;
        }

        const channel = interaction.guild.channels.cache.get(channelId);
        if (!channel || channel.type !== ChannelType.GuildText) {
            const payload = await this.buildPayload(interaction.guild, module);
            await interaction.update(payload);
            return;
        }

        if (
            !interaction.guild.members.me
                ?.permissionsIn(channel)
                .has(PermissionsBitField.Flags.SendMessages)
        ) {
            const payload = await this.buildPayload(interaction.guild, module);
            await interaction.update(payload);
            return;
        }

        if (module === 'birthday') {
            await BirthdayConfig.findOneAndUpdate(
                { GuildId: interaction.guild.id },
                { $set: { ChannelId: channel.id } },
                { upsert: true, returnDocument: 'after' }
            );
        }

        if (module === 'logging') {
            await Logging.findOneAndUpdate(
                { GuildId: interaction.guild.id },
                { $set: { ChannelId: channel.id } },
                { upsert: true, returnDocument: 'after' }
            );
        }

        if (module === 'starboard') {
            await StarBoard.findOneAndUpdate(
                { GuildId: interaction.guild.id },
                { $set: { ChannelId: channel.id } },
                { upsert: true, returnDocument: 'after' }
            );
        }

        if (module === 'welcome') {
            await Welcome.findOneAndUpdate(
                { GuildId: interaction.guild.id },
                { $set: { ChannelId: channel.id } },
                { upsert: true, returnDocument: 'after' }
            );
        }

        const payload = await this.buildPayload(interaction.guild, module);
        await interaction.update(payload);
    }

    private async resolveConfiguredChannelMention(
        guild: Guild,
        module: 'birthday' | 'logging' | 'starboard' | 'welcome',
        channelId?: string | null
    ): Promise<string> {
        if (!channelId) {
            return '`Not Set`';
        }

        const channel =
            guild.channels.cache.get(channelId) ??
            (await guild.channels.fetch(channelId).catch(() => null));

        if (!channel || channel.type !== ChannelType.GuildText) {
            if (module === 'birthday') {
                await BirthdayConfig.findOneAndUpdate(
                    { GuildId: guild.id },
                    { $set: { ChannelId: null } },
                    { upsert: true, returnDocument: 'after' }
                );
            }

            if (module === 'logging') {
                await Logging.findOneAndUpdate(
                    { GuildId: guild.id },
                    { $set: { ChannelId: null } },
                    { upsert: true, returnDocument: 'after' }
                );
            }

            if (module === 'starboard') {
                await StarBoard.findOneAndUpdate(
                    { GuildId: guild.id },
                    { $set: { ChannelId: null } },
                    { upsert: true, returnDocument: 'after' }
                );
            }

            if (module === 'welcome') {
                await Welcome.findOneAndUpdate(
                    { GuildId: guild.id },
                    { $set: { ChannelId: null } },
                    { upsert: true, returnDocument: 'after' }
                );
            }

            return '`Not Set`';
        }

        return `<#${channel.id}>`;
    }

    private async sanitizeRoleMenuRoles(guild: Guild): Promise<string[]> {
        const roleMenu = await RoleMenu.findOne({ GuildId: guild.id });
        if (!roleMenu?.RoleList?.length) {
            return [];
        }

        const validRoleIds = roleMenu.RoleList.filter((roleId: string) =>
            guild.roles.cache.has(roleId)
        );

        if (validRoleIds.length !== roleMenu.RoleList.length) {
            await RoleMenu.findOneAndUpdate(
                { GuildId: guild.id },
                { $set: { RoleList: validRoleIds } },
                { upsert: true, returnDocument: 'after' }
            );
        }

        return validRoleIds;
    }

    private buildModuleSelector(current: ConfigModule): StringSelectMenuBuilder {
        const placeholder =
            current === 'home' ? '⚙️ Home - Choose a module...' : '⚙️ Choose a module...';

        return new StringSelectMenuBuilder()
            .setCustomId(MODULE_SELECT_ID)
            .setPlaceholder(placeholder)
            .addOptions(
                {
                    label: 'AI',
                    value: 'ai',
                    description: 'Enable or disable AI for this server',
                    default: current === 'ai',
                },
                {
                    label: 'Ads Protection',
                    value: 'ads',
                    description: 'Toggle link deletion module',
                    default: current === 'ads',
                },
                {
                    label: 'AutoRole',
                    value: 'autorole',
                    description: 'Set role granted on member join',
                    default: current === 'autorole',
                },
                {
                    label: 'Birthday',
                    value: 'birthday',
                    description: 'Configure birthday announcement channel',
                    default: current === 'birthday',
                },
                {
                    label: 'Dad',
                    value: 'dad',
                    description: 'Toggle Dad responses module',
                    default: current === 'dad',
                },
                {
                    label: 'RoleMenu',
                    value: 'rolemenu',
                    description: 'Configure self-assign role menu',
                    default: current === 'rolemenu',
                },
                {
                    label: 'Logging',
                    value: 'logging',
                    description: 'Set moderation logs channel',
                    default: current === 'logging',
                },
                {
                    label: 'Starboard',
                    value: 'starboard',
                    description: 'Set channel for starred messages',
                    default: current === 'starboard',
                },
                {
                    label: 'Welcome',
                    value: 'welcome',
                    description: 'Configure welcome channel and image',
                    default: current === 'welcome',
                }
            );
    }

    private async getModuleView(guild: Guild, module: ConfigModule): Promise<ModuleViewResult> {
        const selector = this.buildModuleSelector(module);

        if (module === 'home') {
            return {
                title: '# ⚙️ Configuration',
                lines: [
                    '> Select a module from the dropdown.',
                    '> Use the controls below to update settings.',
                ].filter(Boolean),
                controls: [selector],
            };
        }

        if (module === 'ads') {
            const ads = await AdsProtection.findOne({ GuildId: guild.id });
            const isEnabled = ads?.Status === true;
            return {
                title: '# 🛡️ Ads Protection',
                lines: [
                    `> Status: ${isEnabled ? '`Enabled`' : '`Disabled`'}`,
                    '> Deletes non-mod link messages when enabled.',
                ].filter(Boolean),
                controls: [
                    selector,
                    new ButtonBuilder()
                        .setCustomId(ADS_ENABLE_BUTTON_ID)
                        .setLabel('Enable')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(isEnabled),
                    new ButtonBuilder()
                        .setCustomId(ADS_DISABLE_BUTTON_ID)
                        .setLabel('Disable')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(!isEnabled),
                ],
            };
        }

        if (module === 'dad') {
            const dad = await Dad.findOne({ GuildId: guild.id });
            const isEnabled = dad?.Status === true;
            return {
                title: '# 👨‍👧 Dad Module',
                lines: [
                    `> Status: ${isEnabled ? '`Enabled`' : '`Disabled`'}`,
                    '> Responds to "im/i\'m ..." patterns.',
                ].filter(Boolean),
                controls: [
                    selector,
                    new ButtonBuilder()
                        .setCustomId(DAD_ENABLE_BUTTON_ID)
                        .setLabel('Enable')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(isEnabled),
                    new ButtonBuilder()
                        .setCustomId(DAD_DISABLE_BUTTON_ID)
                        .setLabel('Disable')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(!isEnabled),
                ],
            };
        }

        if (module === 'rolemenu') {
            const validRoleIds = await this.sanitizeRoleMenuRoles(guild);
            const rolePreview = validRoleIds.length
                ? validRoleIds
                      .slice(0, 10)
                      .map((id) => `<@&${id}>`)
                      .join(', ')
                : '`None configured`';

            return {
                title: '# 🎛️ RoleMenu',
                lines: [
                    `> Roles Configured: \`${validRoleIds.length.toLocaleString()}\``,
                    `> ${rolePreview}`,
                    `> Hidden (cannot be managed by bot): \`${Math.max(0, guild.roles.cache.size - 1 - this.getManageableRoleIds(guild).length).toLocaleString()}\``,
                    '> Set roles here, then mods can run `/rolemenu` to post/refresh the menu.',
                ].filter(Boolean),
                controls: [
                    selector,
                    this.buildRoleMenuSelect(guild, validRoleIds),
                    new ButtonBuilder()
                        .setCustomId(ROLEMENU_CLEAR_BUTTON_ID)
                        .setLabel('Clear Roles')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(validRoleIds.length === 0),
                ],
            };
        }

        if (module === 'autorole') {
            const autorole = await AutoRole.findOne({ GuildId: guild.id });
            const isEnabled = Boolean(autorole?.Role);
            const roleMention = autorole?.Role ? `<@&${autorole.Role}>` : '`Not Set`';
            return {
                title: '# 🎭 AutoRole',
                lines: [
                    `> Current Role: ${roleMention}`,
                    '> Choose a role below to set AutoRole.',
                ].filter(Boolean),
                controls: [
                    selector,
                    new RoleSelectMenuBuilder()
                        .setCustomId(AUTOROLE_SELECT_ID)
                        .setPlaceholder('Select AutoRole'),
                    new ButtonBuilder()
                        .setCustomId(AUTOROLE_DISABLE_BUTTON_ID)
                        .setLabel('Disable')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(!isEnabled),
                ],
            };
        }

        if (module === 'birthday') {
            const birthday = await BirthdayConfig.findOne({ GuildId: guild.id });
            const channelMention = await this.resolveConfiguredChannelMention(
                guild,
                'birthday',
                birthday?.ChannelId
            );
            const isEnabled = channelMention !== '`Not Set`';
            return {
                title: '# 🎂 Birthday',
                lines: [
                    `> Channel: ${channelMention}`,
                    '> Choose a text channel for birthday announcements.',
                ].filter(Boolean),
                controls: [
                    selector,
                    new ChannelSelectMenuBuilder()
                        .setCustomId(BIRTHDAY_CHANNEL_SELECT_ID)
                        .setPlaceholder('Select birthday channel')
                        .addChannelTypes(ChannelType.GuildText),
                    new ButtonBuilder()
                        .setCustomId(BIRTHDAY_DISABLE_BUTTON_ID)
                        .setLabel('Disable')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(!isEnabled),
                ],
            };
        }

        if (module === 'logging') {
            const logging = await Logging.findOne({ GuildId: guild.id });
            const channelMention = await this.resolveConfiguredChannelMention(
                guild,
                'logging',
                logging?.ChannelId
            );
            const isEnabled = channelMention !== '`Not Set`';
            return {
                title: '# 📝 Logging',
                lines: [
                    `> Channel: ${channelMention}`,
                    '> Select where moderation logs should be sent.',
                ].filter(Boolean),
                controls: [
                    selector,
                    new ChannelSelectMenuBuilder()
                        .setCustomId(LOGGING_CHANNEL_SELECT_ID)
                        .setPlaceholder('Select logging channel')
                        .addChannelTypes(ChannelType.GuildText),
                    new ButtonBuilder()
                        .setCustomId(LOGGING_DISABLE_BUTTON_ID)
                        .setLabel('Disable')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(!isEnabled),
                ],
            };
        }

        if (module === 'starboard') {
            const starboard = await StarBoard.findOne({ GuildId: guild.id });
            const channelMention = await this.resolveConfiguredChannelMention(
                guild,
                'starboard',
                starboard?.ChannelId
            );
            const isEnabled = channelMention !== '`Not Set`';
            return {
                title: '# ⭐ Starboard',
                lines: [
                    `> Channel: ${channelMention}`,
                    '> Select where starred messages are posted.',
                ].filter(Boolean),
                controls: [
                    selector,
                    new ChannelSelectMenuBuilder()
                        .setCustomId(STARBOARD_CHANNEL_SELECT_ID)
                        .setPlaceholder('Select starboard channel')
                        .addChannelTypes(ChannelType.GuildText),
                    new ButtonBuilder()
                        .setCustomId(STARBOARD_DISABLE_BUTTON_ID)
                        .setLabel('Disable')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(!isEnabled),
                ],
            };
        }

        const welcome = await Welcome.findOne({ GuildId: guild.id });
        const channelMention = await this.resolveConfiguredChannelMention(
            guild,
            'welcome',
            welcome?.ChannelId
        );
        const isEnabled = channelMention !== '`Not Set`';
        return {
            title: '# 🖼️ Welcome',
            lines: [`> Channel: ${channelMention}`, '> Select a channel to enable Welcome.'].filter(
                Boolean
            ),
            controls: [
                selector,
                new ChannelSelectMenuBuilder()
                    .setCustomId(WELCOME_CHANNEL_SELECT_ID)
                    .setPlaceholder('Select welcome channel')
                    .addChannelTypes(ChannelType.GuildText),
                new ButtonBuilder()
                    .setCustomId(WELCOME_DISABLE_BUTTON_ID)
                    .setLabel('Disable')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(!isEnabled),
            ],
        };
    }

    private async updateAIWithNotice(
        interaction: ButtonInteraction | AnySelectMenuInteraction,
        notices: AISectionNotices
    ): Promise<void> {
        if (!interaction.guild) {
            return;
        }
        const payload = await this.buildPayload(interaction.guild, 'ai', notices);
        await interaction.update({ ...payload, flags: MessageFlags.IsComponentsV2 });
        setTimeout(async () => {
            try {
                const clean = await this.buildPayload(interaction.guild!, 'ai');
                await interaction.editReply({
                    ...clean,
                    flags: MessageFlags.IsComponentsV2,
                });
            } catch {
                // Ignore edit failures (e.g. token expired after 15 min).
            }
        }, AI_SECTION_NOTICE_TTL_MS);
    }

    private async buildPayload(
        guild: Guild,
        module: ConfigModule,
        aiNotices?: AISectionNotices
    ): Promise<{ components: [ContainerBuilder] }> {
        if (module === 'ai') {
            return this.buildAIPayload(guild, aiNotices);
        }

        const view = await this.getModuleView(guild, module);

        const header = new TextDisplayBuilder().setContent(view.title);
        const body = new TextDisplayBuilder().setContent(view.lines.join('\n'));

        const [firstControl, ...remainingControls] = view.controls;
        const container = new ContainerBuilder().addTextDisplayComponents(header);

        // Keep module dropdown close to title for a cleaner hierarchy.
        if (firstControl) {
            container.addActionRowComponents((row) => row.addComponents(firstControl));
        }

        container
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(body);

        if (remainingControls.length > 0) {
            container.addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small));
        }

        const buttonBuffer: ButtonBuilder[] = [];
        const flushButtons = () => {
            if (!buttonBuffer.length) {
                return;
            }
            const chunk = buttonBuffer.splice(0, 5);
            container.addActionRowComponents((row) => row.addComponents(...chunk));
        };

        // Select menus consume full width; buttons can be grouped.
        for (const control of remainingControls) {
            if (control instanceof ButtonBuilder) {
                buttonBuffer.push(control);
                if (buttonBuffer.length === 5) {
                    flushButtons();
                }
                continue;
            }

            flushButtons();
            container.addActionRowComponents((row) => row.addComponents(control));
        }
        flushButtons();

        return {
            components: [container],
        };
    }

    private async buildAIPayload(
        guild: Guild,
        notices?: AISectionNotices
    ): Promise<{ components: [ContainerBuilder] }> {
        const selector = this.buildModuleSelector('ai');
        const [channels, enabled, currentPersonaId] = await Promise.all([
            getAIAllowedChannels(guild.id),
            isAIGuildEnabled(guild.id),
            getAIGuildPersona(guild.id),
        ]);

        const me = guild.members.me;
        const defaultChannels =
            me && channels.length > 0
                ? channels.filter((id) => {
                      const ch = guild.channels.cache.get(id);
                      return ch && me.permissionsIn(ch).has(PermissionsBitField.Flags.SendMessages);
                  })
                : channels;

        const statusLines = [
            `> Status: ${enabled ? '`Enabled`' : '`Disabled`'}`,
            '> Toggle global AI availability for this server.',
        ];
        if (notices?.status) {
            statusLines.push(`> ${notices.status}`);
        }
        const channelLines = [
            channels.length === 0
                ? '> Mode: `All channels allowed`'
                : `> Mode: \`Allow-list\` · ${channels.length} channel(s): ${channels.map((id) => `<#${id}>`).join(', ')}`,
            '> Select channels to allow AI, or clear to allow all.',
        ];
        if (notices?.channels) {
            channelLines.push(`> ${notices.channels}`);
        }
        const currentPersona = personas[currentPersonaId];
        const personaLabel = currentPersona
            ? personaIdToLabel(currentPersona.id)
            : personaIdToLabel(currentPersonaId);
        const personaLines = [
            '> **⚠️ This sets the default persona.**',
            "> ⛔️ You may need to clear all users' history below for the change to take effect for existing conversations.",
            `> Current: **${personaLabel}**`,
            '> Use the dropdown to change how the AI behaves in this server.',
        ];
        if (notices?.persona) {
            personaLines.push(`> ${notices.persona}`);
        }
        const deleteAllLines = [
            "> Permanently delete every user's AI conversation history in this server.",
        ];
        if (notices?.deleteAllHistory) {
            deleteAllLines.push(`> ${notices.deleteAllHistory}`);
        }

        const personaOptions = Object.entries(personas)
            .map(([value, persona]) => ({
                label: personaIdToLabel(persona.id),
                value,
                description: persona.description,
                default: value === currentPersonaId,
            }))
            .sort((a, b) => a.label.localeCompare(b.label));

        const container = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('# 🤖 AI'))
            .addActionRowComponents((row) => row.addComponents(selector))
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(statusLines.join('\n')))
            .addActionRowComponents((row) =>
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(AI_ENABLE_BUTTON_ID)
                        .setLabel('Enable')
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(enabled),
                    new ButtonBuilder()
                        .setCustomId(AI_DISABLE_BUTTON_ID)
                        .setLabel('Disable')
                        .setStyle(ButtonStyle.Secondary)
                        .setDisabled(!enabled)
                )
            )
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(channelLines.join('\n')))
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
            )
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(personaLines.join('\n')))
            .addActionRowComponents((row) =>
                row.addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId(AI_PERSONA_SELECT_ID)
                        .setPlaceholder('Choose default persona…')
                        .setMinValues(1)
                        .setMaxValues(1)
                        .addOptions(...personaOptions)
                )
            )
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(deleteAllLines.join('\n'))
            )
            .addActionRowComponents((row) =>
                row.addComponents(
                    new ButtonBuilder()
                        .setCustomId(AI_DELETE_ALL_HISTORY_BUTTON_ID)
                        .setLabel("Delete All Users' History")
                        .setStyle(ButtonStyle.Danger)
                )
            );

        return { components: [container] };
    }

    private getManageableRoleIds(guild: Guild): string[] {
        const botMember = guild.members.me;
        if (!botMember) {
            return [];
        }

        return guild.roles.cache
            .filter(
                (role) =>
                    role.id !== guild.id &&
                    !role.managed &&
                    role.position < botMember.roles.highest.position
            )
            .sort((a, b) => b.position - a.position)
            .map((role) => role.id);
    }

    private buildRoleMenuSelect(guild: Guild, selectedRoleIds: string[]): StringSelectMenuBuilder {
        const selectedSet = new Set(selectedRoleIds);
        const manageableRoleIds = this.getManageableRoleIds(guild);
        const optionIds = manageableRoleIds.slice(0, 25);

        const select = new StringSelectMenuBuilder().setCustomId(ROLEMENU_SELECT_ID);

        if (optionIds.length === 0) {
            return select
                .setPlaceholder('No roles available for RoleMenu')
                .setMinValues(0)
                .setMaxValues(1)
                .setDisabled(true)
                .addOptions({ label: 'No manageable roles', value: 'none' });
        }

        select
            .setPlaceholder('Select roles for RoleMenu')
            .setMinValues(1)
            .setMaxValues(optionIds.length)
            .addOptions(
                optionIds.map((roleId) => {
                    const role = guild.roles.cache.get(roleId)!;
                    return {
                        label: role.name.slice(0, 100),
                        value: role.id,
                        default: selectedSet.has(role.id),
                    };
                })
            );

        return select;
    }
}
