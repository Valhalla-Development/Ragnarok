import {
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    ContainerBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import type { Client } from 'discordx';
import prettyMilliseconds from 'pretty-ms';
import type { BalanceInterface } from '../../mongo/Balance.js';
import { capitalise, paginationComponentsV2, RagnarokComponent } from '../Util.js';
import { ecoPrices } from './Config.js';
import { getOrCreateBalance } from './Profile.js';
import type { ButtonRows, CropData, HarvestResult } from './Types.js';

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

// Helper method to calculate decay based on time elapsed.
// `multiplier` lets harvested inventory decay faster than in-ground crops.
function calculateDecay(crop: CropData, currentTime: number, multiplier = 1): number {
    // If crop is not ready for harvest, no decay
    if (crop.CropStatus !== 'harvest') {
        return crop.Decay;
    }

    // Calculate time elapsed in minutes since last update
    const timeElapsedMinutes = (currentTime - (crop.LastUpdateTime || currentTime)) / (1000 * 60);

    // Calculate decay increase (decayRate per minute)
    const decayIncrease = timeElapsedMinutes * ecoPrices.farming.decayRate * multiplier;

    // Update the last update time
    crop.LastUpdateTime = currentTime;

    // Return new decay value, capped at 100
    return Math.min(100, crop.Decay + decayIncrease);
}

// Helper method to update crop growth statuses
function updateCropStatuses(balance: BalanceInterface) {
    const currentTime = Date.now();

    for (const crop of balance.FarmPlot) {
        // Update growth status
        if (typeof crop.CropGrowTime === 'number' && currentTime > crop.CropGrowTime) {
            crop.CropStatus = 'harvest';
            crop.CropGrowTime = 'na';
            crop.Decay = 0;
            crop.LastUpdateTime = currentTime;
        }

        // Update decay for harvestable crops
        if (crop.CropStatus === 'harvest') {
            crop.Decay = calculateDecay(crop, currentTime);
        }
    }

    // Update decay for harvested crops
    if (balance.HarvestedCrops) {
        for (const crop of balance.HarvestedCrops) {
            crop.Decay = calculateDecay(crop, currentTime, 6);
        }
    }
}

// Helper method to get harvestable crops
function getHarvestableCrops(balance: BalanceInterface) {
    return balance.FarmPlot.filter((crop) => crop.CropStatus === 'harvest');
}

// Helper method to calculate time remaining for crop growth
function calculateTimeRemaining(cropGrowTime: number): string {
    const timeDiff = prettyMilliseconds(Date.now() - cropGrowTime, {
        millisecondsDecimalDigits: 1,
    });
    const cleanTime = timeDiff.replace(/-/g, '');
    return cleanTime.substring(0, cleanTime.indexOf('s') + 1);
}

// Helper method to show current crop status when nothing is harvestable
async function showCropStatus(
    interaction: ButtonInteraction,
    client: Client,
    balance: BalanceInterface,
    homeButton: ButtonBuilder
) {
    const statusEntries: string[] = [];

    const growingCrops = balance.FarmPlot.filter((crop) => crop.CropGrowTime !== 'na');
    const readyCrops = balance.FarmPlot.filter((crop) => crop.CropStatus === 'harvest');

    // Add ready crops to status
    for (const crop of readyCrops) {
        statusEntries.push(
            `\u3000Crop Type: \`${capitalise(crop.CropType)}\` - Crop Decay: \`${crop.Decay.toFixed(4)}%\``
        );
    }

    // Add growing crops to status
    for (const crop of growingCrops) {
        const timeRemaining = calculateTimeRemaining(crop.CropGrowTime as number);
        statusEntries.push(
            `\u3000Crop Type: \`${capitalise(crop.CropType)}\` - Time until grown: \`${timeRemaining}\``
        );
    }

    if (!statusEntries.length) {
        await RagnarokComponent(interaction, 'Error', 'No crop data found.', true);
        return;
    }

    const itemsPerPage = 5;
    const totalPages = Math.max(1, Math.ceil(statusEntries.length / itemsPerPage));

    const buildPage = (pageIndex: number): Promise<ContainerBuilder> => {
        const clamped = Math.min(Math.max(0, pageIndex), totalPages - 1);
        const start = clamped * itemsPerPage;
        const pageEntries = statusEntries.slice(start, start + itemsPerPage);

        const header = new TextDisplayBuilder().setContent(
            ['# 🌾 Farm Status', totalPages > 1 ? `> Page: ${clamped + 1}/${totalPages}` : '']
                .filter(Boolean)
                .join('\n')
        );

        const body = new TextDisplayBuilder().setContent(
            [
                `**${client.user?.username ?? 'Ragnarok'} — Harvest**`,
                '',
                '**Current crop status:**',
                ...pageEntries.map((e) => `- ${e.trim()}`),
            ].join('\n')
        );

        const backButton = ButtonBuilder.from(homeButton.toJSON())
            .setDisabled(false)
            .setStyle(ButtonStyle.Primary);

        return Promise.resolve(
            new ContainerBuilder()
                .addTextDisplayComponents(header)
                .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(body)
                .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
                .addActionRowComponents((row) => row.addComponents(backButton))
        );
    };

    await paginationComponentsV2(interaction, buildPage, totalPages);
}

// Helper method to calculate individual crop value with decay
function calculateCropValue(crop: { CropType: string; Decay: number }): { value: number } {
    const cropPrices: { [key: string]: number } = {
        corn: ecoPrices.farming.rewards.corn,
        wheat: ecoPrices.farming.rewards.wheat,
        potato: ecoPrices.farming.rewards.potatoes,
        tomato: ecoPrices.farming.rewards.tomatoes,
    };

    const basePrice = cropPrices[crop.CropType] || 0;
    const value = Math.floor(basePrice * (1 - Number(crop.Decay.toFixed(4)) / 100));

    return { value };
}

// Helper method to process harvest and return results
function processHarvest(balance: BalanceInterface, availableSpots: number): HarvestResult {
    const currentTime = Date.now();
    const harvestedCrops: CropData[] = [];
    const displayEntries: string[] = [];
    let totalValue = 0;

    // Process harvest
    for (let i = 0, harvested = 0; i < balance.FarmPlot.length && harvested < availableSpots; i++) {
        const crop = balance.FarmPlot[i];
        if (crop && crop.CropStatus === 'harvest') {
            // Calculate final decay before harvesting
            crop.Decay = calculateDecay(crop, currentTime);

            const removedCrop = balance.FarmPlot.splice(i, 1)[0];
            if (removedCrop) {
                removedCrop.LastUpdateTime = currentTime; // Set harvest time
                balance.HarvestedCrops.push(removedCrop);
                harvestedCrops.push(removedCrop);
                harvested += 1;
                i -= 1; // Adjust index after splice
            }
        }
    }

    // Calculate values and create display entries
    for (const crop of harvestedCrops) {
        const cropData = calculateCropValue(crop);
        totalValue += cropData.value;
        displayEntries.push(
            `\u3000Crop Type: \`${capitalise(crop.CropType)}\` - Current Value: 💰\`${cropData.value.toLocaleString('en')}\` - Decayed: \`${crop.Decay.toFixed(4)}\`%`
        );
    }

    return { crops: harvestedCrops, totalValue, displayEntries };
}

// Helper method to display harvest results
async function displayHarvestResults(
    interaction: ButtonInteraction,
    client: Client,
    harvestResults: HarvestResult,
    homeButton: ButtonBuilder
) {
    const { displayEntries, totalValue } = harvestResults;

    if (!displayEntries.length) {
        await RagnarokComponent(interaction, 'Error', 'Nothing was harvested.', true);
        return;
    }

    const itemsPerPage = 5;
    const totalPages = Math.max(1, Math.ceil(displayEntries.length / itemsPerPage));

    const buildPage = (pageIndex: number): Promise<ContainerBuilder> => {
        const clamped = Math.min(Math.max(0, pageIndex), totalPages - 1);
        const start = clamped * itemsPerPage;
        const pageEntries = displayEntries.slice(start, start + itemsPerPage);

        const header = new TextDisplayBuilder().setContent(
            ['# ✅ Harvest Complete', totalPages > 1 ? `> Page: ${clamped + 1}/${totalPages}` : '']
                .filter(Boolean)
                .join('\n')
        );

        const body = new TextDisplayBuilder().setContent(
            [
                `**${client.user?.username ?? 'Ragnarok'} — Harvest**`,
                '',
                '**You harvested:**',
                ...pageEntries.map((e) => `- ${e.trim()}`),
                '',
                `**Total value:** 💰 \`${totalValue.toLocaleString('en')}\``,
                '_Tip: crop value continues to decay after harvest — sell sooner rather than later._',
            ].join('\n')
        );

        const backButton = ButtonBuilder.from(homeButton.toJSON())
            .setDisabled(false)
            .setStyle(ButtonStyle.Primary);

        return Promise.resolve(
            new ContainerBuilder()
                .addTextDisplayComponents(header)
                .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(body)
                .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
                .addActionRowComponents((row) => row.addComponents(backButton))
        );
    };

    await paginationComponentsV2(interaction, buildPage, totalPages);
}

// Asynchronous function to handle harvest interaction
export async function handleHarvest(
    interaction: ButtonInteraction,
    client: Client,
    harvestButton: ButtonBuilder,
    homeButton: ButtonBuilder,
    rows: ButtonRows
) {
    // Set the state of the harvest button
    setButtonState(harvestButton, rows);

    // Retrieve user's balance
    const balance = await getOrCreateBalance(interaction);

    // If balance is not found, display error and return
    if (!balance?.Boosts) {
        await RagnarokComponent(
            interaction,
            'Error',
            'No economy profile or farming boosts found. Send a message to create a profile and buy farming tools to unlock harvesting.',
            true
        );
        return;
    }

    // Check if user has a farm plot
    if (!balance.Boosts!.FarmPlot) {
        await RagnarokComponent(
            interaction,
            'Error',
            'You do not have a farming plot! You will be awarded one once you purchase farming tools from the shop. Check `/economy` for more information.',
            true
        );
        return;
    }

    // Update crop statuses
    updateCropStatuses(balance);

    const harvestablecrops = getHarvestableCrops(balance);

    // If no farm plots exist
    if (!balance.FarmPlot.length) {
        await RagnarokComponent(interaction, 'Error', 'You have nothing to harvest!', true);
        return;
    }

    // If no crops are ready to harvest, show crop status
    if (!harvestablecrops.length) {
        await showCropStatus(interaction, client, balance, homeButton);
        return;
    }

    // Check if user has space in farm bag
    const farmBagCapacity = Number(balance.Boosts?.FarmBag ?? 0);
    const availableSpots = farmBagCapacity - balance.HarvestedCrops.length;
    if (availableSpots <= 0) {
        await RagnarokComponent(
            interaction,
            'Error',
            'You do not have enough space to harvest anything!\nYou can upgrade your storage in the shop from `/economy`.',
            true
        );
        return;
    }

    // Harvest crops and calculate results
    const harvestResults = processHarvest(balance, availableSpots);

    // Save balance after harvest
    await balance.save();

    // Display harvest results
    await displayHarvestResults(interaction, client, harvestResults, homeButton);
}
