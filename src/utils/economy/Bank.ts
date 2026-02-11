import type { ButtonBuilder, ModalSubmitInteraction } from 'discord.js';
import { type ButtonInteraction, MessageFlags } from 'discord.js';
import { updateHomeContainer } from './Home.js';
import { getOrCreateBalance } from './Profile.js';

/**
 * Asynchronously handles the deposit button interaction.
 * @param interaction - The ButtonInteraction triggering the deposit function.
 * @param buttons - Button instances from the main Economy class
 */
export async function handleDeposit(
    interaction: ButtonInteraction,
    buttons: {
        baltopButton: ButtonBuilder;
        depositButton: ButtonBuilder;
        heistButton: ButtonBuilder;
        fishButton: ButtonBuilder;
        farmButton: ButtonBuilder;
        itemsButton: ButtonBuilder;
        claimButton: ButtonBuilder;
        withdrawButton: ButtonBuilder;
    }
) {
    // Defer the reply to prevent interaction timeout
    await interaction.deferReply();
    await interaction.deleteReply();

    // Fetch or create user's balance
    const balance = await getOrCreateBalance(interaction);

    // If balance is not found or user has no cash, show an error message and return
    if (!balance || balance.Cash === 0) {
        // Update home container with error message
        const homeContainer = await updateHomeContainer(
            interaction,
            buttons,
            '❌ `You do not have any cash to deposit.`'
        );

        // If home container is available, update the message
        if (homeContainer) {
            await interaction.message?.edit({
                components: [homeContainer],
                files: [],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        // Remove the message after 5 seconds
        setTimeout(async () => {
            const updatedHomeContainer = await updateHomeContainer(interaction, buttons);
            if (updatedHomeContainer) {
                await interaction.message?.edit({
                    components: [updatedHomeContainer],
                    files: [],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
        }, 5000);
        return;
    }

    // Calculate total amount in the bank after deposit
    const bankCalc = balance.Cash + balance.Bank;
    const depositAmount = balance.Cash;

    // Update balance: Set cash to 0, update bank balance and total balance
    balance.Cash = 0;
    balance.Bank = bankCalc;
    balance.Total = bankCalc;

    // Save the updated balance to the database
    await balance.save();

    // Update home container with success message
    const homeContainer = await updateHomeContainer(
        interaction,
        buttons,
        `✅ \`Successfully deposited\` 💰 \`${depositAmount.toLocaleString('en')}\` \`to your bank\``
    );

    // If home container is available, update the message
    if (homeContainer) {
        await interaction.message?.edit({
            components: [homeContainer],
            files: [],
            flags: MessageFlags.IsComponentsV2,
        });
    }

    // Remove the message after 5 seconds
    setTimeout(async () => {
        const updatedHomeContainer = await updateHomeContainer(interaction, buttons);
        if (updatedHomeContainer) {
            await interaction.message?.edit({
                components: [updatedHomeContainer],
                files: [],
                flags: MessageFlags.IsComponentsV2,
            });
        }
    }, 5000);
}

/**
 * Handles the withdraw modal submission by updating the balance and refreshing the home container.
 */
export async function handleWithdraw(
    interaction: ModalSubmitInteraction,
    amount: number,
    buttons: {
        baltopButton: ButtonBuilder;
        depositButton: ButtonBuilder;
        heistButton: ButtonBuilder;
        fishButton: ButtonBuilder;
        farmButton: ButtonBuilder;
        itemsButton: ButtonBuilder;
        claimButton: ButtonBuilder;
        withdrawButton: ButtonBuilder;
    }
) {
    await interaction.deferReply();
    await interaction.deleteReply();

    const balance = await getOrCreateBalance(interaction);

    async function showTemporaryMessage(message: string) {
        const homeContainer = await updateHomeContainer(interaction, buttons, message);

        if (homeContainer) {
            await interaction.message?.edit({
                components: [homeContainer],
                files: [],
                flags: MessageFlags.IsComponentsV2,
            });
        }

        setTimeout(async () => {
            const updatedHomeContainer = await updateHomeContainer(interaction, buttons);
            if (updatedHomeContainer) {
                await interaction.message?.edit({
                    components: [updatedHomeContainer],
                    files: [],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
        }, 5000);
    }

    if (!balance) {
        await showTemporaryMessage(
            '❌ `No economy profile found. Please talk in this server first.`'
        );
        return;
    }

    if (!balance.Bank || balance.Bank <= 0) {
        await showTemporaryMessage('❌ `You have no funds in the bank to withdraw.`');
        return;
    }

    if (Number.isNaN(amount) || amount <= 0) {
        await showTemporaryMessage('❌ `Please enter a valid amount to withdraw.`');
        return;
    }

    if (amount > balance.Bank) {
        await showTemporaryMessage(
            `❌ \`Insufficient funds.\` You only have 💰 \`${balance.Bank.toLocaleString(
                'en'
            )}\` in the bank.`
        );
        return;
    }

    balance.Cash += amount;
    balance.Bank -= amount;
    balance.Total = balance.Cash + balance.Bank;

    await balance.save();

    await showTemporaryMessage(
        `✅ \`Withdrew\` 💰 \`${amount.toLocaleString('en')}\` \`from your bank\``
    );
}
