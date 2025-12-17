import type { ButtonBuilder } from 'discord.js';
import { type ButtonInteraction, MessageFlags } from 'discord.js';
import Balance from '../../mongo/Balance.js';
import { updateHomeContainer } from './Home.js';

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
    }
) {
    // Defer the reply to prevent interaction timeout
    await interaction.deferReply();
    await interaction.deleteReply();

    // Fetch user's balance based on their ID and guild ID
    const balance = await Balance.findOne({
        IdJoined: `${interaction.user.id}-${interaction.guild!.id}`,
    });

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
        `✅ \`Successfully deposited\` <:coin:706659001164628008> \`${depositAmount.toLocaleString('en')}\` \`to your bank\``
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
