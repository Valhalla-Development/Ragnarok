import {
    AttachmentBuilder,
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import type { Client } from 'discordx';
import { RagnarokComponent } from '../Util.js';
import { ecoPrices } from './Config.js';
import { updateHomeContainer } from './Home.js';
import { getOrCreateBalance } from './Profile.js';
import type { ButtonRows, Items } from './Types.js';

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

// Function to generate farm result
export function generateFarmResult() {
    const farmChance = Math.random();
    if (farmChance < 0.0018) {
        return {
            name: 'GoldNugget',
            price: ecoPrices.farming.farmingWithoutTools.goldNugget,
        };
    }
    if (farmChance < 0.0318) {
        return { name: 'Barley', price: ecoPrices.farming.farmingWithoutTools.barley };
    }
    if (farmChance < 0.0918) {
        return { name: 'Spinach', price: ecoPrices.farming.farmingWithoutTools.spinach };
    }
    if (farmChance < 0.3718) {
        return {
            name: 'Strawberries',
            price: ecoPrices.farming.farmingWithoutTools.strawberries,
        };
    }
    return { name: 'Lettuce', price: ecoPrices.farming.farmingWithoutTools.lettuce };
}

// Function to build farm embed
export function buildFarmContainer(
    interaction: ButtonInteraction,
    _client: Client,
    farmResult: { name: string; price: number },
    amt: number,
    attachmentName: string
) {
    const { name, price } = farmResult;
    const header = new TextDisplayBuilder().setContent('## 🌾 Farm');
    const body = new TextDisplayBuilder().setContent(
        [
            `> **Player:** ${interaction.user}`,
            `> **Reward:** \`${name}\``,
            `> **Value:** <:coin:706659001164628008> \`${price.toLocaleString('en')}\``,
            `> **You now have:** \`${amt.toLocaleString('en')}\``,
            '> **Tip:** `Planting crops yields a larger return.`',
        ].join('\n')
    );

    const media = new MediaGalleryBuilder().addItems(
        new MediaGalleryItemBuilder().setURL(`attachment://${attachmentName}`)
    );

    return new ContainerBuilder()
        .addTextDisplayComponents(header)
        .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(body)
        .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
        .addMediaGalleryComponents(media);
}

// Asynchronous function to handle farming interaction
export async function handleFarm(
    interaction: ButtonInteraction,
    client: Client,
    farmButton: ButtonBuilder,
    homeButton: ButtonBuilder,
    rows: ButtonRows,
    buttons: {
        baltopButton: ButtonBuilder;
        gambleButton?: ButtonBuilder;
        depositButton: ButtonBuilder;
        heistButton: ButtonBuilder;
        fishButton: ButtonBuilder;
        farmButton: ButtonBuilder;
        itemsButton: ButtonBuilder;
        claimButton: ButtonBuilder;
        withdrawButton: ButtonBuilder;
    }
) {
    // Set the state of the farm button first
    setButtonState(farmButton, rows);

    // Retrieve user's balance
    const balance = await getOrCreateBalance(interaction);

    // If balance is not found, display error and return
    if (!balance) {
        await RagnarokComponent(
            interaction,
            'Error',
            'No economy profile found. Send a message in this server to create one, then retry farming.',
            true
        );
        return;
    }

    // Check if user is on cooldown
    if (balance.FarmCool !== null) {
        if (Date.now() <= balance.FarmCool) {
            await RagnarokComponent(
                interaction,
                'Error',
                `You are on a cooldown! You will be able to perform this action again <t:${Math.floor(balance.FarmCool / 1000)}:R>.`,
                true
            );
            return;
        }
        balance.FarmCool = 0;
    }

    // Calculate current total farm
    const freeLimit = ecoPrices.farming.freeFarmLimit;
    let currentTotalFarm = 0;

    currentTotalFarm += Number(balance.Items?.Barley) || 0;
    currentTotalFarm += Number(balance.Items?.Spinach) || 0;
    currentTotalFarm += Number(balance.Items?.Strawberries) || 0;
    currentTotalFarm += Number(balance.Items?.Lettuce) || 0;

    // Check if farm bag is full
    if (!balance.Items?.FarmingTools && currentTotalFarm >= Number(freeLimit)) {
        await RagnarokComponent(
            interaction,
            'Error',
            'Your farm bag is full! You can sell your produce via the `sell` button.',
            true
        );
        return;
    }

    // Generate farm result
    const farmResult = generateFarmResult();

    // If farm result is not generated, display error and return
    if (!farmResult) {
        await RagnarokComponent(
            interaction,
            'Error',
            'Could not roll a farm outcome. Please try again in a moment.',
            true
        );
        return;
    }

    // Initialize balance items if not present
    if (!balance.Items) {
        balance.Items = {} as Items;
    }

    // Increment farm result amount in balance items
    const amt = (Number(balance.Items[farmResult.name as keyof typeof balance.Items]) || 0) + 1;
    balance.Items[farmResult.name as keyof typeof balance.Items] = amt as never;

    // Build attachment for farm result image
    const attachmentName = `${farmResult.name}.png`;
    const attachment = new AttachmentBuilder(`assets/economy/${farmResult.name}.png`).setName(
        attachmentName
    );

    const container = buildFarmContainer(interaction, client, farmResult, amt, attachmentName)
        .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
        .addActionRowComponents((row) =>
            row.addComponents(
                ButtonBuilder.from(homeButton.toJSON())
                    .setDisabled(false)
                    .setStyle(ButtonStyle.Primary)
            )
        );

    // Calculate cooldown time and update balance
    const endTime = Date.now() + ecoPrices.farming.cooldowns.farmWinTime;
    balance.FarmCool = Math.round(endTime);
    await balance.save();

    // Defer reply, delete original interaction, update message with embed and attachment
    await interaction.deferReply();
    await interaction.deleteReply();
    await interaction.message?.edit({
        components: [container],
        files: [attachment],
        flags: MessageFlags.IsComponentsV2,
    });

    // Update home container
    const homeContainer = await updateHomeContainer(interaction, buttons);

    // Reset after timeout
    if (homeContainer) {
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
                files: [],
                flags: MessageFlags.IsComponentsV2,
            });
        }, commandTimeout);
    }
}
