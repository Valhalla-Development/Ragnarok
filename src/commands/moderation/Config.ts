import {
    Client, Discord, Slash, SlashGroup, SlashOption,
} from 'discordx';
import {
    ActionRowBuilder,
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonStyle,
    CommandInteraction,
    EmbedBuilder,
} from 'discord.js';
import { Category } from '@discordx/utilities';
import { color } from '../../utils/Util.js';
import AdsProtection from '../../mongo/AdsProtection.js';

@Discord()
@Category('Moderation')
@SlashGroup({ description: 'Configure bot modules', name: 'config' })
@SlashGroup('config')
export class Config {
    @Slash({ description: 'View all available options', name: 'all' })
    async all(interaction: CommandInteraction, client: Client): Promise<void> {
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

        const initial = new EmbedBuilder()
            .setColor(color(interaction.guild!.members.me!.displayHexColor))
            .addFields({
                name: `**${client.user?.username} - Config**`,
                value: '**◎** Click the corresponding button for which module you would like to configure.',
            });

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

        const m = await interaction.reply({ ephemeral: true, components: [row1, row2], embeds: [initial] });

        const filter = (but: { user: { id: string; }; }) => but.user.id !== client.user?.id;

        const collector = m.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async (b) => {
            collector.resetTimer();

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
                            🎭 Disable AutoRole Module: \`/config autorole off\``);

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
                            🎂 Set Birthday Alert Role: \`/config birthday role <@role>\`
                            🎂 Disable Birthday Module: \`/config birthday off\``);

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
        const currentStatus = await AdsProtection.findOne({ GuildId: interaction.guild!.id });

        const embed = new EmbedBuilder()
            .setAuthor({
                name: `${client.user?.username} - Advert Protection`,
                iconURL: `${interaction.guild!.iconURL()}`,
            })
            .setColor(color(interaction.guild!.members.me!.displayHexColor))
            .setDescription(currentStatus?.Status === state ? `Advert Protection is already **${state ? 'enabled.' : 'disabled.'}**` : (
                state ? 'Advert Protection **enabled**.' : 'Advert Protection **disabled**.'
            ));

        if (currentStatus?.Status !== state) {
            await AdsProtection.findOneAndUpdate(
                { GuildId: interaction.guild!.id },
                { $set: { Status: state } },
                { upsert: true, new: true },
            );
        }

        await interaction.reply({ embeds: [embed], ephemeral: true });
    }
}
