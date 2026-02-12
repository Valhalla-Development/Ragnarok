import {
    AttachmentBuilder,
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    ContainerBuilder,
    MessageFlags,
    SectionBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    ThumbnailBuilder,
} from 'discord.js';
import type { Client } from 'discordx';
import { RagnarokComponent } from '../Util.js';
import { ecoPrices } from './Config.js';
import { updateHomeContainer } from './Home.js';
import { getOrCreateBalance } from './Profile.js';
import { scheduleEconomyViewTimer } from './SessionTimers.js';
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

// Function to generate fish result
export function generateFishResult() {
    const fishChance = Math.random();

    // Treasure - 0.18% chance
    if (fishChance < 0.0018) {
        return { name: 'Treasure', price: ecoPrices.fishing.rewards.treasure };
    }

    // Pufferfish - 3% chance (0.18% to 3.18%)
    if (fishChance < 0.0318) {
        return { name: 'PufferFish', price: ecoPrices.fishing.rewards.pufferfish };
    }

    // Swordfish - 6% chance (3.18% to 9.18%)
    if (fishChance < 0.0918) {
        return { name: 'SwordFish', price: ecoPrices.fishing.rewards.swordfish };
    }

    // King Salmon - 18% chance (9.18% to 27.18%)
    if (fishChance < 0.2718) {
        return { name: 'KingSalmon', price: ecoPrices.fishing.rewards.kingSalmon };
    }

    // Trout - 52% chance (27.18% to 79.18%)
    if (fishChance < 0.7918) {
        return { name: 'Trout', price: ecoPrices.fishing.rewards.trout };
    }

    // Fail - 20.82% chance (79.18% to 100%)
    return { name: 'Fail', price: 0 };
}

// Function to build fish embed
export function buildFishContainer(
    interaction: ButtonInteraction,
    _client: Client,
    fishResult: { name: string; price: number },
    amt: number,
    attachmentName: string,
    homeButton?: ButtonBuilder
) {
    const { name, price } = fishResult;
    const header = new TextDisplayBuilder().setContent('## 🎣 Fishing');
    const body = new TextDisplayBuilder().setContent(
        [
            `> **Player:** ${interaction.user}`,
            `> **Catch:** \`${name}\``,
            `> **Value:** 💰 \`${price.toLocaleString('en')}\``,
            `> **You now have:** \`${amt.toLocaleString('en')}\``,
        ].join('\n')
    );

    const thumbnail = new ThumbnailBuilder().setURL(`attachment://${attachmentName}`);

    const section = new SectionBuilder()
        .addTextDisplayComponents(body)
        .setThumbnailAccessory(thumbnail);

    const container = new ContainerBuilder()
        .addTextDisplayComponents(header)
        .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
        .addSectionComponents(section);

    // Add "Back" button if provided
    if (homeButton) {
        container
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addActionRowComponents((row) =>
                row.addComponents(
                    ButtonBuilder.from(homeButton.toJSON())
                        .setDisabled(false)
                        .setStyle(ButtonStyle.Primary)
                )
            );
    }

    return container;
}

// Asynchronous function to handle fishing interaction
export async function handleFish(
    interaction: ButtonInteraction,
    client: Client,
    fishButton: ButtonBuilder,
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
    // Set the state of the fish button first
    setButtonState(fishButton, rows);

    // Retrieve user's balance
    const balance = await getOrCreateBalance(interaction);

    // If balance is not found, display error and return
    if (!balance) {
        await RagnarokComponent(
            interaction,
            'Error',
            'No economy profile found. Send a message in this server to create one, then retry fishing.',
            true
        );
        return;
    }

    // Check if user has a fishing rod
    if (!balance.Items?.FishingRod) {
        await RagnarokComponent(
            interaction,
            'Error',
            'You do not have a fishing rod! You must buy one from the shop.',
            true
        );
        return;
    }

    // Check if user is on cooldown
    const fishCooldown = Number(balance.FishCool ?? 0);
    if (fishCooldown > 0) {
        if (Date.now() <= fishCooldown) {
            await RagnarokComponent(
                interaction,
                'Error',
                `You are on a cooldown! You will be able to perform this action again <t:${Math.floor(fishCooldown / 1000)}:R>.`,
                true
            );
            return;
        }
        balance.FishCool = 0;
    }

    // Calculate current total fish
    let currentTotalFish = 0;

    currentTotalFish += Number(balance.Items?.Trout) || 0;
    currentTotalFish += Number(balance.Items?.KingSalmon) || 0;
    currentTotalFish += Number(balance.Items?.SwordFish) || 0;
    currentTotalFish += Number(balance.Items?.PufferFish) || 0;

    // Check if fish bag is full
    if (currentTotalFish >= Number(balance.Boosts?.FishBag)) {
        await RagnarokComponent(
            interaction,
            'Error',
            'Your fish bag is full! You can sell your fish via the `sell` button.',
            true
        );
        return;
    }

    // Generate fish result
    const fishResult = generateFishResult();

    // If fish result is not generated, display error and return
    if (!fishResult) {
        await RagnarokComponent(
            interaction,
            'Error',
            'Could not roll a fishing outcome. Please try again in a moment.',
            true
        );
        return;
    }

    // If fish result is a fail, handle it and return
    if (fishResult.name === 'Fail') {
        const failMessages = [
            'Your catch escaped the line.',
            'The fish was too strong and broke free!',
            'You felt a tug, but the line went slack...',
            'A big one got away! Better luck next time.',
            'Your bait was stolen by a sneaky fish.',
            'The fish outsmarted you this time.',
            'You reeled in nothing but seaweed.',
            'A school of fish swam right past your hook.',
            'Your line got tangled in some rocks.',
            'The fish took one look at your bait and swam away.',
            'You dozed off and missed the bite.',
            'A crab cut your fishing line!',
            'The current was too strong today.',
            'You cast your line but forgot the bait.',
            'A seagull stole your catch right off the hook!',
        ];

        const randomFailMessage = failMessages[Math.floor(Math.random() * failMessages.length)];

        const endTime = Date.now() + ecoPrices.fishing.cooldowns.fishFailTime;
        balance.FishCool = Math.round(endTime);

        await balance.save();

        const failContainer = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('## 🎣 Fishing'))
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    [
                        `> **Player:** ${interaction.user}`,
                        `> **Result:** ❌ ${randomFailMessage}`,
                        `> **Cooldown:** ⏳ <t:${Math.round(balance.FishCool / 1000)}:R>`,
                    ].join('\n')
                )
            )
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addActionRowComponents((row) =>
                row.addComponents(
                    ButtonBuilder.from(homeButton.toJSON())
                        .setDisabled(false)
                        .setStyle(ButtonStyle.Primary)
                )
            );

        await interaction.deferReply();
        await interaction.deleteReply();
        await interaction.message?.edit({
            components: [failContainer],
            files: [],
            flags: MessageFlags.IsComponentsV2,
        });

        // Reset back to home after a delay (same behavior as win flow)
        const homeContainer = await updateHomeContainer(interaction, buttons);
        if (homeContainer) {
            scheduleEconomyViewTimer(interaction.message?.id, commandTimeout, async () => {
                for (const row of rows) {
                    for (const button of row.components) {
                        button.setStyle(ButtonStyle.Primary);
                        button.setDisabled(false);
                    }
                }

                homeButton.setStyle(ButtonStyle.Success);
                homeButton.setDisabled(true);

                await interaction.message?.edit({
                    components: [homeContainer],
                    files: [],
                    flags: MessageFlags.IsComponentsV2,
                });
            });
        }

        return;
    }

    // Initialize balance items if not present
    if (!balance.Items) {
        balance.Items = {} as Items;
    }

    // Increment fish result amount in balance items
    const amt = (Number(balance.Items[fishResult.name as keyof typeof balance.Items]) || 0) + 1;
    balance.Items[fishResult.name as keyof typeof balance.Items] = amt as never;

    // Build attachment for fish result image
    const attachmentName = `${fishResult.name}.png`;
    const attachment = new AttachmentBuilder(`assets/economy/${fishResult.name}.png`).setName(
        attachmentName
    );

    const container = buildFishContainer(
        interaction,
        client,
        fishResult,
        amt,
        attachmentName,
        homeButton
    );

    // Calculate cooldown time and update balance
    const endTime = Date.now() + ecoPrices.fishing.cooldowns.fishWinTime;
    balance.FishCool = Math.round(endTime);
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
        scheduleEconomyViewTimer(interaction.message?.id, commandTimeout, async () => {
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
        });
    }
}
