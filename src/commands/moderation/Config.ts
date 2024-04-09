import {
    Client, Discord, Guard, Slash, SlashGroup, SlashOption,
} from 'discordx';
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonStyle,
    CategoryChannel,
    ChannelType,
    CommandInteraction,
    EmbedBuilder,
    GuildMemberRoleManager,
    PermissionsBitField,
    Role,
    TextChannel,
} from 'discord.js';
import { Category } from '@discordx/utilities';
import { color } from '../../utils/Util.js';
import AdsProtection from '../../mongo/AdsProtection.js';
import AutoRole from '../../mongo/AutoRole.js';
import { BotHasPerm } from '../../guards/BotHasPerm.js';
import { UserHasPerm } from '../../guards/UserHasPerm.js';
import BirthdayConfig from '../../mongo/BirthdayConfig.js';
import Dad from '../../mongo/Dad.js';
import Logging from '../../mongo/Logging.js';
import TicketConfig from '../../mongo/TicketConfig.js';

@Discord()
@Category('Moderation')
@SlashGroup({ description: 'Configure bot modules', name: 'config' })
@SlashGroup({
    description: 'AutoRole',
    name: 'autorole',
    root: 'config',
})
@SlashGroup({
    description: 'Birthday',
    name: 'birthday',
    root: 'config',
})
@SlashGroup({
    description: 'Logging',
    name: 'logging',
    root: 'config',
})
@SlashGroup({
    description: 'Ticket',
    name: 'ticket',
    root: 'config',
})
@SlashGroup('config')
export class Config {
    @Slash({ description: 'View all available options', name: 'all' })
    /**
     * Displays a menu for configuring various modules.
     * @param interaction - The command interaction triggering this method.
     * @param client - The Discord client instance.
     * @returns A Promise resolving to void.
     */
    async all(interaction: CommandInteraction, client: Client): Promise<void> {
        // Create button components for the menu
        const homeButton = new ButtonBuilder()
            .setEmoji('🏠')
            .setStyle(ButtonStyle.Success)
            .setCustomId('home')
            .setDisabled(true);

        const adsProtButton = new ButtonBuilder()
            .setLabel('Ad Prot')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('ads');

        const autoroleButton = new ButtonBuilder()
            .setLabel('Autorole')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('autorole');

        const birthdayButton = new ButtonBuilder()
            .setLabel('Birthday')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('birthday');

        const dadButton = new ButtonBuilder()
            .setLabel('Dad')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('dad');

        const loggingButton = new ButtonBuilder()
            .setLabel('Logging')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('logging');

        const rolemenuButton = new ButtonBuilder()
            .setLabel('Rolemenu')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('rolemenu');

        const ticketsButton = new ButtonBuilder()
            .setLabel('Tickets')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('tickets');

        const welcomeButton = new ButtonBuilder()
            .setLabel('Welcome')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('welcome');

        const starboardButton = new ButtonBuilder()
            .setLabel('Starboard')
            .setStyle(ButtonStyle.Primary)
            .setCustomId('starboard');

        const row1 = new ActionRowBuilder<ButtonBuilder>().addComponents(
            homeButton,
            adsProtButton,
            autoroleButton,
            birthdayButton,
            dadButton,
        );

        const row2 = new ActionRowBuilder<ButtonBuilder>().addComponents(
            loggingButton,
            rolemenuButton,
            ticketsButton,
            welcomeButton,
            starboardButton,
        );

        // Initial embed to display with the menu
        const initial = new EmbedBuilder()
            .setColor(color(interaction.guild!.members.me!.displayHexColor))
            .addFields({
                name: `**${client.user?.username} - Config**`,
                value: '**◎** Click the corresponding button for which module you would like to configure.',
            });

        // Function to set button states when a button is clicked
        function setButtonState(button: ButtonBuilder) {
            // Loop through each button in the array, except the provided 'button'.
            [homeButton, adsProtButton, autoroleButton, birthdayButton, dadButton,
                loggingButton, rolemenuButton, ticketsButton, welcomeButton, starboardButton].forEach((otherButton) => {
                // If the button is not the provided 'button', set its style to primary and enable it.
                if (otherButton !== button) {
                    otherButton.setStyle(ButtonStyle.Primary);
                    otherButton.setDisabled(false);
                }
            });

            // Disable the provided 'button' and set its style to success.
            button.setDisabled(true);
            button.setStyle(ButtonStyle.Success);
        }

        // Send the initial menu message
        const m = await interaction.reply({ ephemeral: true, components: [row1, row2], embeds: [initial] });

        const filter = (but: { user: { id: string; }; }) => but.user.id !== client.user?.id;

        // Create a message component collector to listen for button clicks
        const collector = m.createMessageComponentCollector({ filter, time: 15000 });

        // Event listener for when a button is clicked
        collector.on('collect', async (b) => {
            collector.resetTimer();

            // Check which button was clicked and update the menu accordingly
            if (b.customId === 'home') {
                setButtonState(homeButton);

                await b.update({ embeds: [initial], components: [row1, row2] });
                return;
            }

            if (b.customId === 'ads') {
                setButtonState(adsProtButton);

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `${client.user?.username} - Advert Protection Configuration`,
                        iconURL: `${interaction.guild!.iconURL()}`,
                    })
                    .setColor(color(interaction.guild!.members.me!.displayHexColor))
                    .setDescription('🚫 Toggle Advert Protection: `/config adsprot <true/false>`');

                await b.update({ embeds: [embed], components: [row1, row2] });
                return;
            }

            if (b.customId === 'autorole') {
                setButtonState(autoroleButton);

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `${client.user?.username} - AutoRole Module Configuration`,
                        iconURL: `${interaction.guild!.iconURL()}`,
                    })
                    .setColor(color(interaction.guild!.members.me!.displayHexColor))
                    .setDescription(`🎭 Set AutoRole: \`/config autorole role <@role>\`
                            🎭 Disable AutoRole Module: \`/config autorole disable\``);

                await b.update({ embeds: [embed], components: [row1, row2] });
                return;
            }

            if (b.customId === 'birthday') {
                setButtonState(birthdayButton);

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `${client.user?.username} - Birthday Module Configuration`,
                        iconURL: `${interaction.guild!.iconURL()}`,
                    })
                    .setColor(color(interaction.guild!.members.me!.displayHexColor))
                    .setDescription(`🎂 Set Birthday Alert Channel: \`/config birthday channel <#channel>\`
                            🎂 Disable Birthday Module: \`/config birthday disable\``);

                await b.update({ embeds: [embed], components: [row1, row2] });
                return;
            }

            if (b.customId === 'dad') {
                setButtonState(dadButton);

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `${client.user?.username} - Dad Bot Module Configuration`,
                        iconURL: `${interaction.guild!.iconURL()}`,
                    })
                    .setColor(color(interaction.guild!.members.me!.displayHexColor))
                    .setDescription('👨‍👧 Toggle Dad Bot: `/config dadbot <true/false>`');

                await b.update({ embeds: [embed], components: [row1, row2] });
                return;
            }

            if (b.customId === 'logging') {
                setButtonState(loggingButton);

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `${client.user?.username} - Logging Module Configuration`,
                        iconURL: `${interaction.guild!.iconURL()}`,
                    })
                    .setColor(color(interaction.guild!.members.me!.displayHexColor))
                    .setDescription(`📝 Set Logging Channel: \`/config logging channel <#channel>\`
                            📝 Disable Logging Module: \`/config logging off\``);

                await b.update({ embeds: [embed], components: [row1, row2] });
                return;
            }

            if (b.customId === 'rolemenu') {
                setButtonState(rolemenuButton);

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `${client.user?.username} - Role Menu Configuration`,
                        iconURL: `${interaction.guild!.iconURL()}`,
                    })
                    .setColor(color(interaction.guild!.members.me!.displayHexColor))
                    .setDescription(`🔵 Add Role to Role Menu: \`/config rolemenu add <@role>\`
                            🔵 Remove Role from Role Menu: \`/config rolemenu remove <@role>\`
                            🔵 Clear Role Menu: \`/config rolemenu clear\``);

                await b.update({ embeds: [embed], components: [row1, row2] });
                return;
            }

            if (b.customId === 'tickets') {
                setButtonState(ticketsButton);

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `${client.user?.username} - Ticket Module Configuration`,
                        iconURL: `${interaction.guild!.iconURL()}`,
                    })
                    .setColor(color(interaction.guild!.members.me!.displayHexColor))
                    .setDescription(`🔹 Assign Ticket Category: \`/config ticket category <#category>\`
                            🔹 Assign Ticket Logging Channel: \`/config ticket channel <#channel>\`
                            🔹 Specify Custom Support Role: \`/config ticket role <@role>\`
                            🔹 Disable Ticket Module: \`/config ticket off\``);

                await b.update({ embeds: [embed], components: [row1, row2] });
                return;
            }

            if (b.customId === 'welcome') {
                setButtonState(welcomeButton);

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `${client.user?.username} - Welcome Module Configuration`,
                        iconURL: `${interaction.guild!.iconURL()}`,
                    })
                    .setColor(color(interaction.guild!.members.me!.displayHexColor))
                    .setDescription(`🖼 Set Welcome Image: \`/config welcome image <url-to-image>\`
                            🖼 Set Welcome Channel: \`/config welcome channel <#channel>\`
                            🖼 Disable Welcome Module: \`/config welcome off\``);

                await b.update({ embeds: [embed], components: [row1, row2] });
                return;
            }

            if (b.customId === 'starboard') {
                setButtonState(starboardButton);

                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `${client.user?.username} - Star Board Module Configuration`,
                        iconURL: `${interaction.guild!.iconURL()}`,
                    })
                    .setColor(color(interaction.guild!.members.me!.displayHexColor))
                    .setDescription(`🌟 Set Star Board Channel: \`/config starboard channel <#channel>\`
                            🌟 Disable Star Board Module: \`/config starboard off\``);
                await b.update({ embeds: [embed], components: [row1, row2] });
            }
        });

        // Event listener for when the collector ends (due to timeout)
        collector.on('end', (_, reason) => {
            if (reason === 'time') {
                // Disable button and update message
                homeButton.setDisabled(true);
                adsProtButton.setDisabled(true);
                autoroleButton.setDisabled(true);
                birthdayButton.setDisabled(true);
                dadButton.setDisabled(true);
                loggingButton.setDisabled(true);
                rolemenuButton.setDisabled(true);
                ticketsButton.setDisabled(true);
                welcomeButton.setDisabled(true);
                starboardButton.setDisabled(true);

                interaction.editReply({ components: [row1, row2] });
            }
        });
    }

    @Slash({ description: 'Advert Protection Configuration', name: 'adsprot' })
    /**
     * Configures the Advert Protection module.
     * @param state - The new state to set for Advert Protection (true for enabled, false for disabled).
     * @param interaction - The command interaction triggering this method.
     * @param client - The Discord client instance.
     * @returns A Promise resolving to void.
     */
    async configAdsProt(
        @SlashOption({
            description: 'Toggle Advert Protection',
            name: 'state',
            required: true,
            type: ApplicationCommandOptionType.Boolean,
        })
            state: boolean,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        // Check the current status of Advert Protection for the guild
        const currentStatus = await AdsProtection.findOne({ GuildId: interaction.guild!.id });

        // Construct the embed to display the updated status
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${client.user?.username} - Advert Protection`,
                iconURL: `${interaction.guild!.iconURL()}`,
            })
            .setColor(color(interaction.guild!.members.me!.displayHexColor))
            .setDescription(currentStatus?.Status === state ? `Advert Protection is already **${state ? 'enabled.' : 'disabled.'}**` : (
                state ? 'Advert Protection **enabled**.' : 'Advert Protection **disabled**.'
            ));

        // Update the status of Advert Protection if it has changed
        if (currentStatus?.Status !== state) {
            await AdsProtection.findOneAndUpdate(
                { GuildId: interaction.guild!.id },
                { $set: { Status: state } },
                { upsert: true, new: true },
            );
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    @Slash({ description: 'AutoRole Module Configuration', name: 'role' })
    @SlashGroup('autorole', 'config')
    @Guard(BotHasPerm([PermissionsBitField.Flags.ManageRoles]), UserHasPerm([PermissionsBitField.Flags.ManageRoles]))
    /**
     * Configures the AutoRole module.
     * @param role - The role to set as AutoRole.
     * @param interaction - The command interaction triggering this method.
     * @param client - The Discord client instance.
     * @returns A Promise resolving to void.
     */
    async configAutorole(
        @SlashOption({
            description: 'Set AutoRole',
            name: 'role',
            type: ApplicationCommandOptionType.Role,
            required: true,
        })
            role: Role,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        // Construct the embed to display the result of the configuration
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${client.user?.username} - AutoRole Module`,
                iconURL: `${interaction.guild!.iconURL()}`,
            })
            .setColor(color(interaction.guild!.members.me!.displayHexColor));

        // Get the member's roles and the bot's highest role position
        const member = interaction.member!.roles as GuildMemberRoleManager;
        const botHighestRole = interaction.guild!.members.me!.roles.highest.position;

        // Check if the provided role is higher than the member's highest role or the bot's highest role
        if (role.position >= member.highest.position || role.position >= botHighestRole) {
            embed.setDescription(role.position >= member.highest.position
                ? 'You can not set a role that is higher than your highest role.'
                : 'You can not set a role that is higher than my highest role.');
        } else {
            // Update or insert the AutoRole document in the database
            await AutoRole.findOneAndUpdate(
                { GuildId: interaction.guild!.id },
                { $set: { Role: role.id }, $setOnInsert: { GuildId: interaction.guild!.id } },
                { upsert: true, new: true },
            );
            embed.setDescription(`Autorole set to ${role}`);
        }

        await interaction.reply({ ephemeral: true, embeds: [embed] });
    }

    @Slash({ description: 'Disable AutoRole Module', name: 'disable' })
    @SlashGroup('autorole', 'config')
    /**
     * Disables the AutoRole module.
     * @param interaction - The command interaction triggering this method.
     * @param client - The Discord client instance.
     * @returns A Promise resolving to void.
     */
    async disableAutoRole(
        interaction: CommandInteraction,
        client: Client,
    ): Promise<void> {
        // Check the current status of AutoRole for the guild
        const currentStatus = await AutoRole.findOne({ GuildId: interaction.guild!.id });

        // Construct the embed to display the result of the operation
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${client.user?.username} - AutoRole Module`,
                iconURL: `${interaction.guild!.iconURL()}`,
            })
            .setColor(color(interaction.guild!.members.me!.displayHexColor));

        // If AutoRole is not enabled, inform the user and return
        if (!currentStatus) {
            embed.setDescription('AutoRole is not enabled.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        embed.setDescription('AutoRole **disabled**.');

        // Delete the AutoRole document from the database
        await AutoRole.deleteOne({ GuildId: interaction.guild!.id });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    /**
     * Configures the Birthday module.
     * @param channel - The channel to set as Birthday alerts.
     * @param interaction - The command interaction triggering this method.
     * @param client - The Discord client instance.
     * @returns A Promise resolving to void.
     */
    @Slash({ description: 'Birthday Module Configuration', name: 'channel' })
    @SlashGroup('birthday', 'config')
    async configBirthdayChannel(
        @SlashOption({
            description: 'Set Birthday Channel',
            name: 'channel',
            type: ApplicationCommandOptionType.Channel,
            required: true,
        })
            channel: TextChannel,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        // Construct the embed to display the result of the configuration
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${client.user?.username} - Birthday Module`,
                iconURL: `${interaction.guild!.iconURL()}`,
            })
            .setColor(color(interaction.guild!.members.me!.displayHexColor));

        if (channel.type !== ChannelType.GuildText) {
            embed.setDescription('Please provide a valid `GuildTextBasedChannel`.');
            await interaction.reply({ ephemeral: true, embeds: [embed] });
            return;
        }

        // Check if the bot has the SendMessages permissions within the provided channel
        if (!interaction.guild!.members.me!.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages)) {
            embed.setDescription('I lack the `SendMessages` permission within the provided channel.');
            await interaction.reply({ ephemeral: true, embeds: [embed] });
            return;
        }

        // Update or insert the Birthday document in the database
        await BirthdayConfig.findOneAndUpdate(
            { GuildId: interaction.guild!.id },
            { $set: { ChannelId: channel.id }, $setOnInsert: { GuildId: interaction.guild!.id } },
            { upsert: true, new: true },
        );
        embed.setDescription(`Birthday channel set to ${channel}`);

        await interaction.reply({ ephemeral: true, embeds: [embed] });
    }

    @Slash({ description: 'Disable Birthday Module', name: 'disable' })
    @SlashGroup('birthday', 'config')
    /**
     * Disables the Birthday module.
     * @param interaction - The command interaction triggering this method.
     * @param client - The Discord client instance.
     * @returns A Promise resolving to void.
     */
    async disableBirthday(
        interaction: CommandInteraction,
        client: Client,
    ): Promise<void> {
        // Check the current status of Birthday for the guild
        const currentStatus = await BirthdayConfig.findOne({ GuildId: interaction.guild!.id });

        // Construct the embed to display the result of the operation
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${client.user?.username} - Birthday Module`,
                iconURL: `${interaction.guild!.iconURL()}`,
            })
            .setColor(color(interaction.guild!.members.me!.displayHexColor));

        // If Birthday is not enabled, inform the user and return
        if (!currentStatus) {
            embed.setDescription('Birthday module is not enabled.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        embed.setDescription('Birthday module **disabled**.');

        // Delete the Birthday document from the database
        await BirthdayConfig.deleteOne({ GuildId: interaction.guild!.id });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    /**
     * Configures the Dad module.
     * @param state - The boolean value of the state of the Dad module.
     * @param interaction - The command interaction triggering this method.
     * @param client - The Discord client instance.
     * @returns A Promise resolving to void.
     */
    @Slash({ description: 'Dad Module Configuratin', name: 'dad' })
    async configDadModule(
        @SlashOption({
            description: 'Toggle Dad module',
            name: 'state',
            type: ApplicationCommandOptionType.Boolean,
            required: true,
        })
            state: boolean,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        // Check the current status of Dad for the guild
        const currentStatus = await Dad.findOne({ GuildId: interaction.guild!.id });

        // Construct the embed to display the result of the operation
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${client.user?.username} - Dad Module`,
                iconURL: `${interaction.guild!.iconURL()}`,
            })
            .setColor(color(interaction.guild!.members.me!.displayHexColor));

        // If the user is attempting to enable the Dad module
        if (state) {
            // If Dad is already enabled
            if (currentStatus) {
                embed.setDescription('Dad module is already enabled.');
                await interaction.reply({ embeds: [embed], ephemeral: true });
                return;
            }

            embed.setDescription('Dad module **enabled**.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            await new Dad({
                GuildId: interaction.guild!.id,
                Status: true,
            }).save();
            return;
        }

        if (!currentStatus) {
            embed.setDescription('Dad module is not enabled.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        embed.setDescription('Dad module **disabled**.');
        await interaction.reply({ embeds: [embed], ephemeral: true });
        await Dad.deleteOne({ GuildId: interaction.guild!.id });

        embed.setDescription('Dad module **disabled**.');

        // Delete the Dad document from the database
        await Dad.deleteOne({ GuildId: interaction.guild!.id });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    /**
     * Configures the Logging module.
     * @param channel - The channel to set as Logging alerts.
     * @param interaction - The command interaction triggering this method.
     * @param client - The Discord client instance.
     * @returns A Promise resolving to void.
     */
    @Slash({ description: 'Logging Module Configuration', name: 'channel' })
    @SlashGroup('logging', 'config')
    async configLoggingChannel(
        @SlashOption({
            description: 'Set Logging Channel',
            name: 'channel',
            type: ApplicationCommandOptionType.Channel,
            required: true,
        })
            channel: TextChannel,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        // Construct the embed to display the result of the configuration
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${client.user?.username} - Logging Module`,
                iconURL: `${interaction.guild!.iconURL()}`,
            })
            .setColor(color(interaction.guild!.members.me!.displayHexColor));

        if (channel.type !== ChannelType.GuildText) {
            embed.setDescription('Please provide a valid `GuildTextBasedChannel`.');
            await interaction.reply({ ephemeral: true, embeds: [embed] });
            return;
        }

        // Check if the bot has the SendMessages permissions within the provided channel
        if (!interaction.guild!.members.me!.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages)) {
            embed.setDescription('I lack the `SendMessages` permission within the provided channel.');
            await interaction.reply({ ephemeral: true, embeds: [embed] });
            return;
        }

        // Update or insert the Logging document in the database
        await Logging.findOneAndUpdate(
            { GuildId: interaction.guild!.id },
            { $set: { ChannelId: channel.id }, $setOnInsert: { GuildId: interaction.guild!.id } },
            { upsert: true, new: true },
        );
        embed.setDescription(`Logging channel set to ${channel}`);

        await interaction.reply({ ephemeral: true, embeds: [embed] });
    }

    @Slash({ description: 'Disable Logging Module', name: 'disable' })
    @SlashGroup('logging', 'config')
    /**
     * Disables the Logging module.
     * @param interaction - The command interaction triggering this method.
     * @param client - The Discord client instance.
     * @returns A Promise resolving to void.
     */
    async disableLogging(
        interaction: CommandInteraction,
        client: Client,
    ): Promise<void> {
        // Check the current status of Birthday for the guild
        const currentStatus = await Logging.findOne({ GuildId: interaction.guild!.id });

        // Construct the embed to display the result of the operation
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${client.user?.username} - Logging Module`,
                iconURL: `${interaction.guild!.iconURL()}`,
            })
            .setColor(color(interaction.guild!.members.me!.displayHexColor));

        // If Logging is not enabled, inform the user and return
        if (!currentStatus) {
            embed.setDescription('Logging module is not enabled.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        embed.setDescription('Logging module **disabled**.');

        // Delete the Logging document from the database
        await Logging.deleteOne({ GuildId: interaction.guild!.id });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }

    /**
     * Configures the Ticket module.
     * @param category - The category to set as Ticket parents.
     * @param interaction - The command interaction triggering this method.
     * @param client - The Discord client instance.
     * @returns A Promise resolving to void.
     */
    @Slash({ description: 'Ticket Module Configuration', name: 'category' })
    @SlashGroup('ticket', 'config')
    async configTicketCategory(
        @SlashOption({
            description: 'Set Ticket Category',
            name: 'channel',
            type: ApplicationCommandOptionType.Channel,
            required: true,
        })
            category: CategoryChannel,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        // Construct the embed to display the result of the configuration
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${client.user?.username} - Ticket Module`,
                iconURL: `${interaction.guild!.iconURL()}`,
            })
            .setColor(color(interaction.guild!.members.me!.displayHexColor));

        if (category.type !== ChannelType.GuildCategory) {
            embed.setDescription('Please provide a valid `CategoryChannel`.');
            await interaction.reply({ ephemeral: true, embeds: [embed] });
            return;
        }

        // Update or insert the Logging document in the database
        await TicketConfig.findOneAndUpdate(
            { GuildId: interaction.guild!.id },
            { $set: { Category: category.id }, $setOnInsert: { GuildId: interaction.guild!.id } },
            { upsert: true, new: true },
        );
        embed.setDescription(`Ticket category set to \`${category.name}\``);

        await interaction.reply({ ephemeral: true, embeds: [embed] });
    }

    /**
     * Configures the Ticket module.
     * @param channel - The channel to set as Logging alerts.
     * @param interaction - The command interaction triggering this method.
     * @param client - The Discord client instance.
     * @returns A Promise resolving to void.
     */
    @Slash({ description: 'Ticket Module Configuration', name: 'channel' })
    @SlashGroup('ticket', 'config')
    async configTicketChannel(
        @SlashOption({
            description: 'Set Ticket Logging Channel',
            name: 'channel',
            type: ApplicationCommandOptionType.Channel,
            required: true,
        })
            channel: TextChannel,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        // Construct the embed to display the result of the configuration
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${client.user?.username} - Ticket Module`,
                iconURL: `${interaction.guild!.iconURL()}`,
            })
            .setColor(color(interaction.guild!.members.me!.displayHexColor));

        if (channel.type !== ChannelType.GuildText) {
            embed.setDescription('Please provide a valid `GuildTextBasedChannel`.');
            await interaction.reply({ ephemeral: true, embeds: [embed] });
            return;
        }

        // Check if the bot has the SendMessages permissions within the provided channel
        if (!interaction.guild!.members.me!.permissionsIn(channel).has(PermissionsBitField.Flags.SendMessages)) {
            embed.setDescription('I lack the `SendMessages` permission within the provided channel.');
            await interaction.reply({ ephemeral: true, embeds: [embed] });
            return;
        }

        // Update or insert the Ticket document in the database
        await TicketConfig.findOneAndUpdate(
            { GuildId: interaction.guild!.id },
            { $set: { LogChannel: channel.id }, $setOnInsert: { GuildId: interaction.guild!.id } },
            { upsert: true, new: true },
        );
        embed.setDescription(`Ticket Logging channel set to ${channel}`);

        await interaction.reply({ ephemeral: true, embeds: [embed] });
    }

    /**
     * Configures the Ticket module.
     * @param role - The role to set as Support Team for Tickets.
     * @param interaction - The command interaction triggering this method.
     * @param client - The Discord client instance.
     * @returns A Promise resolving to void.
     */
    @Slash({ description: 'Ticket Module Configuration', name: 'role' })
    @SlashGroup('ticket', 'config')
    async configTicketRole(
        @SlashOption({
            description: 'Set Ticket Support Role',
            name: 'role',
            type: ApplicationCommandOptionType.Role,
            required: true,
        })
            role: Role,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        // Construct the embed to display the result of the configuration
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${client.user?.username} - Ticket Module`,
                iconURL: `${interaction.guild!.iconURL()}`,
            })
            .setColor(color(interaction.guild!.members.me!.displayHexColor));

        // Update or insert the Ticket document in the database
        await TicketConfig.findOneAndUpdate(
            { GuildId: interaction.guild!.id },
            { $set: { Role: role.id }, $setOnInsert: { GuildId: interaction.guild!.id } },
            { upsert: true, new: true },
        );
        embed.setDescription(`Ticket Support Role set to ${role}`);

        await interaction.reply({ ephemeral: true, embeds: [embed] });
    }

    @Slash({ description: 'Disable Ticket Module', name: 'disable' })
    @SlashGroup('ticket', 'config')
    /**
     * Disables the Ticket module.
     * @param interaction - The command interaction triggering this method.
     * @param client - The Discord client instance.
     * @returns A Promise resolving to void.
     */
    async disableTicket(
        interaction: CommandInteraction,
        client: Client,
    ): Promise<void> {
        // Check the current status of Ticket for the guild
        const currentStatus = await TicketConfig.findOne({ GuildId: interaction.guild!.id });

        // Construct the embed to display the result of the operation
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${client.user?.username} - Ticket Module`,
                iconURL: `${interaction.guild!.iconURL()}`,
            })
            .setColor(color(interaction.guild!.members.me!.displayHexColor));

        // If Ticket is not enabled, inform the user and return
        if (!currentStatus) {
            embed.setDescription('Ticket module is not enabled.');
            await interaction.reply({ embeds: [embed], ephemeral: true });
            return;
        }

        embed.setDescription('Ticket module **disabled**.');

        // Delete the Ticket document from the database
        await TicketConfig.deleteOne({ GuildId: interaction.guild!.id });

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}
