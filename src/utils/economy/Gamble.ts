import {
    ActionRowBuilder,
    type APIEmbed,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    EmbedBuilder,
    ModalBuilder,
    type ModalSubmitInteraction,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import type { Client } from 'discordx';
import Balance from '../../mongo/Balance.js';
import { color, RagnarokComponent } from '../Util.js';
import { updateHomeContainer } from './Home.js';
import type { ButtonRows } from './Types.js';

// Add timeout duration property (in milliseconds)
const commandTimeout = 10_000; // 10 seconds

/**
 * This method sets the state of a button.
 * @param button - The button to set the state for.
 * @param rows - All button rows to iterate through
 */
function setButtonState(button: ButtonBuilder, rows: ButtonRows) {
    // Loop through all buttons in the rows
    for (const row of rows) {
        for (const otherButton of row.components) {
            // If the button is not the provided 'button', set its style to primary and enable it
            if (otherButton !== button) {
                otherButton.setStyle(ButtonStyle.Primary);
                otherButton.setDisabled(false);
            }
        }
    }

    // Disable the provided 'button' and set its style to success.
    button.setDisabled(true);
    button.setStyle(ButtonStyle.Success);
}

/**
 * Asynchronously handles the coinflip interaction.
 * @param interaction - The ModalSubmitInteraction or ButtonInteraction triggering the coinflip function.
 * @param client - The Discord client.
 * @param coinflipButton - The coinflip button instance
 * @param homeButton - The home button instance
 * @param homeEmbed - The home embed instance
 * @param rows - Button rows for state management
 * @param buttons - All button instances
 * @param amount - The amount to bet, default is null.
 * @param option - The chosen option (heads or tails), default is null.
 */
export async function handleCoinflip(
    interaction: ModalSubmitInteraction | ButtonInteraction,
    client: Client,
    coinflipButton: ButtonBuilder,
    homeButton: ButtonBuilder,
    homeEmbed: EmbedBuilder | null,
    rows: ButtonRows,
    buttons: {
        baltopButton: ButtonBuilder;
        depositButton: ButtonBuilder;
        heistButton: ButtonBuilder;
        fishButton: ButtonBuilder;
        farmButton: ButtonBuilder;
        itemsButton: ButtonBuilder;
        claimButton: ButtonBuilder;
    },
    amount: string | null = null,
    option: string | null = null
) {
    // Set the state of the coinflip button first if it's a button interaction
    if (interaction instanceof ButtonInteraction) {
        setButtonState(coinflipButton, rows);
    }

    // Fetch user's balance based on their ID and guild ID
    const balance = await Balance.findOne({
        IdJoined: `${interaction.user.id}-${interaction.guild!.id}`,
    });

    // If balance is not found, show an error message and return
    if (!balance) {
        await RagnarokComponent(
            interaction,
            'Error',
            'No economy profile found. Send a message in this server to create one, then retry coinflip.',
            true
        );
        return;
    }

    // If no amount and option are provided and the interaction is a ButtonInteraction, show a modal for specifying an amount
    if (!(amount || option) && interaction instanceof ButtonInteraction) {
        const coinflipModal = new ModalBuilder()
            .setTitle('Coin Flip Amount')
            .setCustomId('coinflipAmount');

        const amountField = new TextInputBuilder()
            .setCustomId('amountField')
            .setLabel('Amount to bet')
            .setPlaceholder('2850')
            .setStyle(TextInputStyle.Short)
            .setMinLength(2)
            .setRequired(true);

        const coinRow = new ActionRowBuilder<TextInputBuilder>().addComponents(amountField);

        coinflipModal.addComponents(coinRow);

        await interaction.showModal(coinflipModal);
        return;
    }

    // Define buttons for heads, tails, and cancel
    const headsButton = new ButtonBuilder()
        .setLabel('Heads!')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('economy_coinflip_heads');

    const tailsButton = new ButtonBuilder()
        .setLabel('Tails!')
        .setStyle(ButtonStyle.Primary)
        .setCustomId('economy_coinflip_tails');

    const cancelButton = new ButtonBuilder()
        .setLabel('Cancel')
        .setStyle(ButtonStyle.Danger)
        .setCustomId('economy_home');

    const coinRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
        headsButton,
        tailsButton,
        cancelButton
    );

    // If no option provided, check for valid amount and sufficient balance, then start the coin flip
    if (option) {
        // If option is provided, determine win or loss, update balance, and display result
        const flip = ['heads', 'tails'];
        const answer = flip[Math.floor(Math.random() * flip.length)];

        const win = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.user.displayName}`,
                iconURL: `${interaction.user.avatarURL()}`,
            })
            .setColor(color(interaction.guild?.members.me?.displayHexColor ?? '#5865F2'))
            .addFields({
                name: `**${client.user?.username} - Coin Flip**`,
                value: `**◎** ${interaction.user} won! <:coin:706659001164628008> \`${Number(
                    amount
                ).toLocaleString('en')}\` has been credited to your Bank!`,
            });

        const lose = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.user.displayName}`,
                iconURL: `${interaction.user.avatarURL()}`,
            })
            .setColor(color(interaction.guild?.members.me?.displayHexColor ?? '#5865F2'))
            .addFields({
                name: `**${client.user?.username} - Coin Flip**`,
                value: `**◎** ${interaction.user} lost <:coin:706659001164628008> \`${Number(
                    amount
                ).toLocaleString('en')}\``,
            });

        headsButton.setDisabled(true);
        tailsButton.setDisabled(true);

        // Update balance based on win or loss
        if (option === answer) {
            balance.Bank += Number(amount);
            balance.Total += Number(amount);
        } else {
            balance.Bank -= Number(amount);
            balance.Total -= Number(amount);
        }

        await interaction.deferReply();
        await interaction.deleteReply();

        // Display result message with the appropriate embed
        await interaction.message?.edit({
            components: [coinRow],
            embeds: [option === answer ? win : lose],
        });
        await balance.save();

        // Update home embed after the coin flip
        const homeContainer = await updateHomeContainer(interaction, buttons);

        // If interaction is a ButtonInteraction and home embed exists, update the message with home embed after a delay
        if (interaction instanceof ButtonInteraction && homeEmbed && homeContainer) {
            setTimeout(async () => {
                // Reset all buttons to primary style and enabled
                for (const row of rows) {
                    for (const button of row.components) {
                        button.setStyle(ButtonStyle.Primary);
                        button.setDisabled(false);
                    }
                }
                // Set home button to success style and disabled
                homeButton.setStyle(ButtonStyle.Success);
                homeButton.setDisabled(true);

                await interaction.message?.edit({
                    components: [homeContainer],
                    embeds: [homeEmbed as APIEmbed],
                    files: [],
                });
            }, commandTimeout);
        }
    } else {
        if (Number.isNaN(Number(amount))) {
            await RagnarokComponent(
                interaction,
                'Error',
                'The specified amount was not a valid number.',
                true
            );
            return;
        }

        if (Number(amount) > balance.Bank) {
            await RagnarokComponent(
                interaction,
                'Error',
                `You do not have enough to bet <:coin:706659001164628008> \`${Number(
                    amount
                ).toLocaleString('en')}\`, you have <:coin:706659001164628008> \`${Number(
                    balance.Bank
                ).toLocaleString('en')}\` available in your Bank.`,
                true
            );
            return;
        }

        const initial = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.user.displayName}`,
                iconURL: `${interaction.user.avatarURL()}`,
            })
            .setColor(color(interaction.guild?.members.me?.displayHexColor ?? '#5865F2'))
            .addFields({
                name: `**${client.user?.username} - Coin Flip**`,
                value: `**◎** ${interaction.user} bet <:coin:706659001164628008> \`${Number(
                    amount
                ).toLocaleString('en')}\``,
            });

        await interaction.message?.edit({
            embeds: [initial],
            components: [coinRow],
            files: [],
        });
    }
}
