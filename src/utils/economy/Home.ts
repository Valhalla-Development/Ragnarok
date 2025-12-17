import {
    ButtonBuilder,
    ButtonInteraction,
    type CommandInteraction,
    ContainerBuilder,
    MessageFlags,
    type ModalSubmitInteraction,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
// @ts-expect-error no type file available for this package
import converter from 'number-to-words-en';
import Balance, { type BalanceInterface } from '../../mongo/Balance.js';
import { RagnarokComponent } from '../Util.js';

/**
 * Builds the home container with all sections
 * @param interaction - The interaction to get user data from
 * @param balance - The user's balance data
 * @param rankPos - The user's rank position
 * @param currentTotalSeeds - Total number of seeds
 * @param currentTotalFish - Total number of fish
 * @param currentTotalFarm - Total number of farm items
 * @param claimUserTime - Time for claim cooldown
 * @param wealthStatusMessage - Temporary message to display under wealth text
 * @param claimStatusMessage - Temporary message to display in treasure vault section
 * @param buttons - Button instances from the main Economy class
 * @returns ContainerBuilder with all sections
 */
export function buildHomeContainer(
    interaction: CommandInteraction | ButtonInteraction | ModalSubmitInteraction,
    balance: BalanceInterface,
    rankPos: string,
    currentTotalSeeds: number,
    currentTotalFish: number,
    currentTotalFarm: number,
    claimUserTime: number,
    buttons: {
        baltopButton: ButtonBuilder;
        depositButton: ButtonBuilder;
        heistButton: ButtonBuilder;
        fishButton: ButtonBuilder;
        farmButton: ButtonBuilder;
        itemsButton: ButtonBuilder;
        claimButton: ButtonBuilder;
    },
    wealthStatusMessage?: string,
    claimStatusMessage?: string
): ContainerBuilder {
    // ═══════════════════════════════════════════════════════════════
    // User Profile & Rank
    // ═══════════════════════════════════════════════════════════════
    const headerText = new TextDisplayBuilder().setContent(
        [
            `# 🏰 **${interaction.user.displayName}'s Empire**`,
            `> 👑 ***Rank ${rankPos} on Leaderboard***`,
        ].join('\n')
    );

    // ═══════════════════════════════════════════════════════════════
    // Balance Display
    // ═══════════════════════════════════════════════════════════════
    const wealthText = new TextDisplayBuilder().setContent(
        [
            '## 💎 **Wealth Portfolio**',
            `> 💵 **Wallet Cash:** \`${balance.Cash.toLocaleString('en')}\` <:coin:706659001164628008>`,
            `> 🏦 **Bank Vault:** \`${balance.Bank.toLocaleString('en')}\` <:coin:706659001164628008>`,
            `> 🌟 **Net Worth:** \`${balance.Total.toLocaleString('en')}\` <:coin:706659001164628008>`,
            wealthStatusMessage ? `> ${wealthStatusMessage}` : '',
        ].join('\n')
    );

    // ═══════════════════════════════════════════════════════════════
    // Cooldown Display
    // ═══════════════════════════════════════════════════════════════
    const activityText = new TextDisplayBuilder().setContent(
        [
            '## ⚡ **Activity Status**',
            `> 🔥 **Heist:** ${Date.now() > balance.StealCool ? '✅ `Ready to Strike!`' : `⏳ <t:${Math.round(balance.StealCool / 1000)}:R>`}`,
            `> 🎣 **Fishing:** ${balance.Items?.FishingRod ? `${Date.now() > balance.FishCool ? '✅ `Cast Your Line!`' : `⏳ <t:${Math.round(balance.FishCool / 1000)}:R>`}` : '❌ `Need Fishing Rod`'}`,
            `> 🌾 **Farming:** ${Date.now() > balance.FarmCool ? '✅ `Harvest Time!`' : `⏳ <t:${Math.round(balance.FarmCool / 1000)}:R>`}`,
        ].join('\n')
    );

    // ═══════════════════════════════════════════════════════════════
    // Inventory Management
    // ═══════════════════════════════════════════════════════════════
    const storageText = new TextDisplayBuilder().setContent(
        [
            '## 🎒 **Storage Empire**',
            `> 🌱 **Seed Vault:** ${
                balance.Boosts?.SeedBag
                    ? `\`${Number(currentTotalSeeds).toLocaleString('en')}\` / \`${Number(balance.Boosts.SeedBag).toLocaleString('en')}\``
                    : '🚫 `Vault Locked`'
            }`,
            `> 🐟 **Fish Cooler:** ${
                balance.Boosts?.FishBag
                    ? `\`${Number(currentTotalFish).toLocaleString('en')}\` / \`${Number(balance.Boosts.FishBag).toLocaleString('en')}\``
                    : '🚫 `Cooler Locked`'
            }`,
            `> 🥕 **Harvest Bin:** ${
                balance.Boosts?.FarmBag
                    ? `\`${Number(currentTotalFarm).toLocaleString('en')}\` / \`${Number(balance.Boosts.FarmBag).toLocaleString('en')}\``
                    : '🚫 `Bin Locked`'
            }`,
            `> 🏡 **Farm Plots:** ${
                balance.Boosts?.FarmPlot
                    ? `\`${balance.FarmPlot.length.toLocaleString('en')}\` / \`${Number(balance.Boosts.FarmPlot).toLocaleString('en')}\``
                    : '🚫 `No Land Owned`'
            }`,
        ].join('\n')
    );

    // ═══════════════════════════════════════════════════════════════
    // Claim Rewards
    // ═══════════════════════════════════════════════════════════════
    const treasureText = new TextDisplayBuilder().setContent(
        [
            '## 🎁 **Treasure Vault**',
            `> ⏰ **Hourly Chest:** ${balance.ClaimNewUser ? (Date.now() > balance.ClaimNewUser ? '🎉 `Open Now!`' : `⏳ <t:${claimUserTime}:R>`) : Date.now() > balance.Hourly ? '🎉 `Open Now!`' : `⏳ <t:${Math.round(balance.Hourly / 1000)}:R>`}`,
            `> 🌅 **Daily Vault:** ${balance.ClaimNewUser ? (Date.now() > balance.ClaimNewUser ? '🎉 `Open Now!`' : `⏳ <t:${claimUserTime}:R>`) : Date.now() > balance.Daily ? '🎉 `Open Now!`' : `⏳ <t:${Math.round(balance.Daily / 1000)}:R>`}`,
            `> 📅 **Weekly Safe:** ${balance.ClaimNewUser ? (Date.now() > balance.ClaimNewUser ? '🎉 `Open Now!`' : `⏳ <t:${claimUserTime}:R>`) : Date.now() > balance.Weekly ? '🎉 `Open Now!`' : `⏳ <t:${Math.round(balance.Weekly / 1000)}:R>`}`,
            `> 🗓️ **Monthly Prize:** ${balance.ClaimNewUser ? (Date.now() > balance.ClaimNewUser ? '🎉 `Open Now!`' : `⏳ <t:${claimUserTime}:R>`) : Date.now() > balance.Monthly ? '🎉 `Open Now!`' : `⏳ <t:${Math.round(balance.Monthly / 1000)}:R>`}`,
            claimStatusMessage ? `> ${claimStatusMessage}` : '',
        ].join('\n')
    );

    // Check if anything is claimable
    const now = Date.now();
    const hasClaimNewUserBlock = balance.ClaimNewUser && now <= balance.ClaimNewUser;
    const isHourlyClaimable = !balance.Hourly || now > balance.Hourly;
    const isDailyClaimable = !balance.Daily || now > balance.Daily;
    const isWeeklyClaimable = !balance.Weekly || now > balance.Weekly;
    const isMonthlyClaimable = !balance.Monthly || now > balance.Monthly;

    const hasClaimableRewards =
        !hasClaimNewUserBlock &&
        (isHourlyClaimable || isDailyClaimable || isWeeklyClaimable || isMonthlyClaimable);

    // Clone the claim button and disable it if nothing is claimable
    const claimButton = ButtonBuilder.from(buttons.claimButton.toJSON());

    if (!hasClaimableRewards) {
        claimButton.setDisabled(true);
    }

    // Build and return the stunning container
    return new ContainerBuilder()
        .addTextDisplayComponents(headerText)
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Large))
        .addTextDisplayComponents(wealthText)
        .addActionRowComponents((row) =>
            row.addComponents(buttons.baltopButton, buttons.depositButton)
        )
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(activityText)
        .addActionRowComponents((row) =>
            row.addComponents(buttons.heistButton, buttons.fishButton, buttons.farmButton)
        )
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(storageText)
        .addActionRowComponents((row) => row.addComponents(buttons.itemsButton))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(treasureText)
        .addActionRowComponents((row) => row.addComponents(claimButton));
}

/**
 * Asynchronously updates the home container based on user interaction.
 * @param interaction - The interaction (Command, Button, or Modal) triggering the update.
 * @param client - The Discord client.
 * @param buttons - Button instances from the main Economy class
 * @param wealthStatusMessage - Temporary message to display under wealth text
 * @param claimStatusMessage - Temporary message to display in treasure vault section
 * @returns The built home container
 */
export async function updateHomeContainer(
    interaction: CommandInteraction | ButtonInteraction | ModalSubmitInteraction,
    buttons: {
        baltopButton: ButtonBuilder;
        depositButton: ButtonBuilder;
        heistButton: ButtonBuilder;
        fishButton: ButtonBuilder;
        farmButton: ButtonBuilder;
        itemsButton: ButtonBuilder;
        claimButton: ButtonBuilder;
    },
    wealthStatusMessage?: string,
    claimStatusMessage?: string
): Promise<ContainerBuilder | null> {
    // Fetch user balance based on their ID and guild ID
    const balance = await Balance.findOne({
        IdJoined: `${interaction.user.id}-${interaction.guild!.id}`,
    });

    // If balance is not found, show an error message and return
    if (!balance) {
        await RagnarokComponent(interaction, 'Error', 'An error occurred, please try again.', true);
        return null;
    }

    // Fetch user leaderboard rank
    const userRank: BalanceInterface[] = await Balance.find({
        GuildId: interaction.guild!.id,
    }).sort({ Total: -1 });
    const userPos = userRank.find(
        (b) => b.IdJoined === `${interaction.user.id}-${interaction.guild!.id}`
    );

    const rankPos = converter.toOrdinal(userRank.indexOf(userPos!) + 1);

    // Map item types to their respective names
    const itemTypes = new Map<string, string[]>([
        ['seeds', ['CornSeeds', 'WheatSeeds', 'PotatoSeeds', 'TomatoSeeds']],
        ['fish', ['Trout', 'KingSalmon', 'Swordfish', 'Pufferfish']],
        ['crops', ['corn', 'wheat', 'potato', 'tomato']],
    ]);

    // Calculate claim cooldown time in seconds
    const claimUserTime = balance.ClaimNewUser ? Math.round(balance.ClaimNewUser / 1000) : 0;

    // Function to calculate total count of items of a specific type
    function calculateTotal(itemType: string, bal: BalanceInterface): number {
        const types = itemTypes.get(itemType);
        if (!types) {
            return 0;
        }

        return types.reduce((acc, type) => {
            const itemQuantity = bal?.Items?.[type as keyof typeof bal.Items] || 0;
            return acc + (typeof itemQuantity === 'number' ? itemQuantity : 0);
        }, 0);
    }

    // Calculate totals and prepare data
    const currentTotalSeeds = calculateTotal('seeds', balance);
    const currentTotalFish = calculateTotal('fish', balance);
    const currentTotalFarm = balance.HarvestedCrops?.length
        ? balance.HarvestedCrops.filter((crop: { CropType: string }) =>
              itemTypes.get('crops')?.includes(crop.CropType)
          ).length
        : 0;

    // Build the container
    return buildHomeContainer(
        interaction,
        balance,
        rankPos,
        currentTotalSeeds,
        currentTotalFish,
        currentTotalFarm,
        claimUserTime,
        buttons,
        wealthStatusMessage,
        claimStatusMessage
    );
}

/**
 * Asynchronously handles the home interaction (Command or Button).
 * @param interaction - The interaction (Command or Button) triggering the home function.
 * @param buttons - Button instances from the main Economy class
 */
export async function handleHome(
    interaction: CommandInteraction | ButtonInteraction,
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
    // Update the home embed based on the interaction
    const homeContainer = await updateHomeContainer(interaction, buttons);

    if (!homeContainer) {
        return;
    }

    // If the interaction is a ButtonInteraction, update the original message
    if (interaction instanceof ButtonInteraction) {
        await interaction.deferReply(); // Defer the original reply to prevent timeout
        await interaction.deleteReply();

        // Edit the original message with the updated embed and components
        await interaction.message.edit({
            components: [homeContainer],
            files: [],
            flags: MessageFlags.IsComponentsV2,
        });
    } else {
        // If the interaction is a CommandInteraction, reply with the updated embed and components
        await interaction.reply({
            components: [homeContainer],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}
