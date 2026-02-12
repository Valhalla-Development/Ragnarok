import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ContainerBuilder,
    MessageFlags,
    ModalBuilder,
    type ModalSubmitInteraction,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import type { Client } from 'discordx';
import { RagnarokComponent } from '../Util.js';
import { buildGambleMenuContainer } from './GambleMenu.js';
import { getOrCreateBalance } from './Profile.js';
import { scheduleEconomyViewTimer } from './SessionTimers.js';
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
 * @param rows - Button rows for state management
 * @param buttons - All button instances
 * @param amount - The amount to bet, default is null.
 * @param option - The chosen option (heads or tails), default is null.
 */
export async function handleCoinflip(
    interaction: ModalSubmitInteraction | ButtonInteraction,
    _client: Client,
    coinflipButton: ButtonBuilder,
    homeButton: ButtonBuilder,
    rows: ButtonRows,
    _buttons: {
        baltopButton: ButtonBuilder;
        gambleButton?: ButtonBuilder;
        depositButton: ButtonBuilder;
        heistButton: ButtonBuilder;
        fishButton: ButtonBuilder;
        farmButton: ButtonBuilder;
        itemsButton: ButtonBuilder;
        claimButton: ButtonBuilder;
        withdrawButton: ButtonBuilder;
    },
    amount: string | null = null,
    option: string | null = null
) {
    // Set the state of the coinflip button first if it's a button interaction
    if (interaction instanceof ButtonInteraction) {
        setButtonState(coinflipButton, rows);
    }

    // Fetch user's balance based on their ID and guild ID
    const balance = await getOrCreateBalance(interaction);

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

    const backButton = ButtonBuilder.from(homeButton.toJSON())
        .setDisabled(false)
        .setStyle(ButtonStyle.Primary);

    const buildContainer = (title: string, content: string, includeRow = true) => {
        const header = new TextDisplayBuilder().setContent(title);
        const body = new TextDisplayBuilder().setContent(content);

        const container = new ContainerBuilder()
            .addTextDisplayComponents(header)
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(body);

        if (includeRow) {
            container
                .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
                .addActionRowComponents((row) =>
                    row.addComponents(headsButton, tailsButton, backButton)
                );
        }

        return container;
    };

    // If no option provided, check for valid amount and sufficient balance, then start the coin flip
    if (option) {
        // If option is provided, determine win or loss, update balance, and display result
        const flip = ['heads', 'tails'];
        const answer = flip[Math.floor(Math.random() * flip.length)];

        headsButton.setDisabled(true);
        headsButton.setStyle(ButtonStyle.Success);
        tailsButton.setDisabled(true);
        tailsButton.setStyle(ButtonStyle.Success);

        // Update balance based on win or loss
        if (option === answer) {
            balance.Bank = Number(balance.Bank ?? 0) + Number(amount);
            balance.Total = Number(balance.Total ?? 0) + Number(amount);
        } else {
            balance.Bank = Number(balance.Bank ?? 0) - Number(amount);
            balance.Total = Number(balance.Total ?? 0) - Number(amount);
        }

        await interaction.deferReply();
        await interaction.deleteReply();

        const wager = Number(amount);
        const won = option === answer;

        const resultTitle = won ? '# ✅ Coin Flip — Victory' : '# ❌ Coin Flip — Defeat';
        const resultBody = won
            ? `> ${interaction.user} won!\n> 💰 \`${wager.toLocaleString(
                  'en'
              )}\` has been credited to your Bank.`
            : `> ${interaction.user} lost.\n> 💰 \`${wager.toLocaleString('en')}\` was deducted from your Bank.`;

        const resultContainer = buildContainer(resultTitle, resultBody, true);

        await interaction.message?.edit({
            components: [resultContainer],
            files: [],
            flags: MessageFlags.IsComponentsV2,
        });
        await balance.save();

        // Reset back to the Gamble menu after a delay
        if (interaction instanceof ButtonInteraction) {
            scheduleEconomyViewTimer(interaction.message?.id, commandTimeout, async () => {
                // Reset all buttons to primary style and enabled
                for (const row of rows) {
                    for (const button of row.components) {
                        button.setStyle(ButtonStyle.Primary);
                        button.setDisabled(false);
                    }
                }

                const gambleMenu = buildGambleMenuContainer({
                    homeButton,
                    coinflipButton,
                });

                await interaction.message?.edit({
                    components: [gambleMenu],
                    files: [],
                    flags: MessageFlags.IsComponentsV2,
                });
            });
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

        const bankAmount = Number(balance.Bank ?? 0);
        if (Number(amount) > bankAmount) {
            await RagnarokComponent(
                interaction,
                'Error',
                `You do not have enough to bet 💰 \`${Number(amount).toLocaleString(
                    'en'
                )}\`, you have 💰 \`${bankAmount.toLocaleString('en')}\` available in your Bank.`,
                true
            );
            return;
        }

        const initialContainer = buildContainer(
            '# 🪙 Coin Flip',
            `> ${interaction.user} wagered 💰 \`${Number(amount).toLocaleString(
                'en'
            )}\`.\n> Choose **Heads** or **Tails**.`,
            true
        );

        await interaction.message?.edit({
            components: [initialContainer],
            files: [],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}
