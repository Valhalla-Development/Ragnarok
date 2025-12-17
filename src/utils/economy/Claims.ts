import { type ButtonBuilder, type ButtonInteraction, ButtonStyle, MessageFlags } from 'discord.js';
import type { Client } from 'discordx';
import Balance from '../../mongo/Balance.js';
import { RagnarokEmbed } from '../Util.js';
import { ecoPrices } from './Config.js';
import { updateHomeContainer } from './Home.js';
import type { ButtonRows, Claim, EcoPrices } from './Types.js';

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
 * Asynchronously handles the claim button interaction.
 * @param interaction - The ButtonInteraction triggering the claim function.
 * @param client - The Discord client.
 * @param claimButton - The claim button instance
 * @param rows - Button rows for state management
 * @param buttons - Button instances from the main Economy class
 */
export async function handleClaim(
    interaction: ButtonInteraction,
    client: Client,
    claimButton: ButtonBuilder,
    rows: ButtonRows,
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
    // Set the state of the claim button first
    setButtonState(claimButton, rows);

    // Fetch user's balance based on their ID and guild ID
    const balance = await Balance.findOne({
        IdJoined: `${interaction.user.id}-${interaction.guild!.id}`,
    });

    // If balance is not found, show an error message and return
    if (!balance) {
        await RagnarokEmbed(
            client,
            interaction,
            'Error',
            'An error occurred, please try again.',
            true
        );
        return;
    }

    // Check if user has new user claim cooldown
    if (balance.ClaimNewUser) {
        if (Date.now() > balance.ClaimNewUser) {
            balance.ClaimNewUser = 0;
        } else {
            const nowInSecond = Math.round(balance.ClaimNewUser / 1000);
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                `Your Economy profile is too new! Please wait another <t:${nowInSecond}:R> before using this command.`,
                true
            );
            return;
        }
    }

    // Check and reset other claim cooldowns if necessary
    const keys: (keyof Claim)[] = ['Hourly', 'Daily', 'Weekly', 'Monthly'];

    for (const key of keys) {
        if (balance[key] && Date.now() > balance[key]) {
            balance[key] = 0;
        }
    }

    // Check if there is anything to claim
    if (Date.now() < Math.min(balance.Hourly, balance.Daily, balance.Weekly, balance.Monthly)) {
        await RagnarokEmbed(client, interaction, 'Error', ' You have nothing to claim!', true);
        return;
    }

    // Calculate the total claim price and update balance
    let fullPrice = 0;

    const periods = ['Hourly', 'Daily', 'Weekly', 'Monthly'];
    const prices: EcoPrices = {
        Hourly: ecoPrices.claims.hourly,
        Daily: ecoPrices.claims.daily,
        Weekly: ecoPrices.claims.weekly,
        Monthly: ecoPrices.claims.monthly,
    };

    for (const period of periods) {
        if (!balance[period as keyof typeof balance]) {
            const priceRange = prices[period as keyof EcoPrices];
            fullPrice +=
                Math.floor(Math.random() * (priceRange.max - priceRange.min + 1)) + priceRange.min;
        }
    }

    const endTime = Date.now();

    balance.Hourly = balance.Hourly ? balance.Hourly : endTime + 3_600_000;
    balance.Daily = balance.Daily ? balance.Daily : endTime + 86_400_000;
    balance.Weekly = balance.Weekly ? balance.Weekly : endTime + 604_800_000;
    balance.Monthly = balance.Monthly ? balance.Monthly : endTime + 2_629_800_000;
    balance.Bank += fullPrice;
    balance.Total += fullPrice;

    await balance.save();

    // Defer the reply to prevent interaction timeout
    await interaction.deferReply();
    await interaction.deleteReply();

    // Update home container with success message in treasure vault section
    const homeContainer = await updateHomeContainer(
        interaction,
        client,
        buttons,
        undefined,
        `✅ \`Claimed all available rewards!\` <:coin:706659001164628008> \`${fullPrice.toLocaleString('en')}\` \`added to bank\``
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
        const updatedHomeContainer = await updateHomeContainer(interaction, client, buttons);
        if (updatedHomeContainer) {
            await interaction.message?.edit({
                components: [updatedHomeContainer],
                files: [],
                flags: MessageFlags.IsComponentsV2,
            });
        }
    }, 5000);
}
