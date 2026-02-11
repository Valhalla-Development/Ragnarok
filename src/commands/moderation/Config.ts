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
import StarBoard from '../../mongo/StarBoard.js';
import Welcome from '../../mongo/Welcome.js';

type ConfigModule =
    | 'home'
    | 'ads'
    | 'autorole'
    | 'birthday'
    | 'dad'
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
const DAD_ENABLE_BUTTON_ID = 'cfg:dad:enable';
const DAD_DISABLE_BUTTON_ID = 'cfg:dad:disable';
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

    @ButtonComponent({ id: ADS_ENABLE_BUTTON_ID })
    async onAdsEnable(interaction: ButtonInteraction): Promise<void> {
        if (!interaction.guild) {
            return;
        }
        await AdsProtection.findOneAndUpdate(
            { GuildId: interaction.guild.id },
            { $set: { Status: true } },
            { upsert: true, new: true }
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
            { upsert: true, new: true }
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
                { upsert: true, new: true }
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
                { upsert: true, new: true }
            );
        }

        if (module === 'logging') {
            await Logging.findOneAndUpdate(
                { GuildId: interaction.guild.id },
                { $set: { ChannelId: channel.id } },
                { upsert: true, new: true }
            );
        }

        if (module === 'starboard') {
            await StarBoard.findOneAndUpdate(
                { GuildId: interaction.guild.id },
                { $set: { ChannelId: channel.id } },
                { upsert: true, new: true }
            );
        }

        if (module === 'welcome') {
            await Welcome.findOneAndUpdate(
                { GuildId: interaction.guild.id },
                { $set: { ChannelId: channel.id } },
                { upsert: true, new: true }
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
                    { upsert: true, new: true }
                );
            }

            if (module === 'logging') {
                await Logging.findOneAndUpdate(
                    { GuildId: guild.id },
                    { $set: { ChannelId: null } },
                    { upsert: true, new: true }
                );
            }

            if (module === 'starboard') {
                await StarBoard.findOneAndUpdate(
                    { GuildId: guild.id },
                    { $set: { ChannelId: null } },
                    { upsert: true, new: true }
                );
            }

            if (module === 'welcome') {
                await Welcome.findOneAndUpdate(
                    { GuildId: guild.id },
                    { $set: { ChannelId: null } },
                    { upsert: true, new: true }
                );
            }

            return '`Not Set`';
        }

        return `<#${channel.id}>`;
    }

    private buildModuleSelector(current: ConfigModule): StringSelectMenuBuilder {
        const placeholder =
            current === 'home' ? '⚙️ Home - Choose a module...' : '⚙️ Choose a module...';

        return new StringSelectMenuBuilder()
            .setCustomId(MODULE_SELECT_ID)
            .setPlaceholder(placeholder)
            .addOptions(
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

    private async buildPayload(guild: Guild, module: ConfigModule) {
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
}
