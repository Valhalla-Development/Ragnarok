import type { ButtonInteraction } from 'discord.js';
import {
    ButtonBuilder,
    ContainerBuilder,
    MessageFlags,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import type { BalanceInterface } from '../../mongo/Balance.js';
import { RagnarokComponent } from '../Util.js';
import { ecoPrices } from './Config.js';
import { getOrCreateBalance } from './Profile.js';

const num = (value: unknown) => Number(value ?? 0);

/**
 * Build a component container showing the user's inventory.
 */
function buildInventoryContainer(
    balance: BalanceInterface,
    interactionUserName: string,
    homeButton: ButtonBuilder
): ContainerBuilder {
    const items = (balance.Items ?? {}) as NonNullable<BalanceInterface['Items']>;
    const boosts = (balance.Boosts ?? {}) as NonNullable<BalanceInterface['Boosts']>;
    const backHome = ButtonBuilder.from(homeButton.toJSON());

    const header = new TextDisplayBuilder().setContent(
        [
            `# 🎒 ${interactionUserName}'s Inventory`,
            '> Quick view of your gear, boosts, and stash.',
        ].join('\n')
    );

    const tools = new TextDisplayBuilder().setContent(
        [
            '## 🛠️ Tools',
            `> 🪝 Fishing Rod: ${items.FishingRod ? '✅ Owned' : '❌ Not Owned'}`,
            `> 🪓 Farming Tools: ${items.FarmingTools ? '✅ Owned' : '❌ Not Owned'}`,
        ].join('\n')
    );

    const boostsSection = new TextDisplayBuilder().setContent(
        [
            '## 📦 Boosts & Capacity',
            `> 🐟 Fish Bag: ${
                boosts.FishBag
                    ? `\`${(
                          num(items.Trout) +
                              num(items.KingSalmon) +
                              num(items.SwordFish) +
                              num(items.PufferFish)
                      ).toLocaleString(
                          'en'
                      )}\` / \`${Number(boosts.FishBag).toLocaleString('en')}\``
                    : '🚫 Locked'
            }`,
            `> 🌱 Seed Bag: ${
                boosts.SeedBag
                    ? `\`${(
                          num(items.CornSeeds) +
                              num(items.WheatSeeds) +
                              num(items.PotatoSeeds) +
                              num(items.TomatoSeeds)
                      ).toLocaleString(
                          'en'
                      )}\` / \`${Number(boosts.SeedBag).toLocaleString('en')}\``
                    : '🚫 Locked'
            }`,
            `> 🥕 Farm Bin: ${
                boosts.FarmBag
                    ? items.FarmingTools
                        ? `\`${(balance.HarvestedCrops?.length ?? 0).toLocaleString(
                              'en'
                          )}\` / \`${Number(boosts.FarmBag).toLocaleString('en')}\``
                        : `\`${(
                              num(items.Barley) +
                                  num(items.Spinach) +
                                  num(items.Strawberries) +
                                  num(items.Lettuce)
                          ).toLocaleString(
                              'en'
                          )}\` / \`${Number(boosts.FarmBag).toLocaleString('en')}\``
                    : '🚫 Locked'
            }`,
            `> 🏡 Farm Plots: ${
                boosts.FarmPlot
                    ? `\`${balance.FarmPlot?.length ?? 0}\` / \`${Number(boosts.FarmPlot).toLocaleString('en')}\``
                    : '🚫 No Land Owned'
            }`,
            `> 🏦 Auto Deposit: ${boosts.AutoDeposit ? '✅ Enabled' : '❌ Not Owned'}`,
        ].join('\n')
    );

    const fishSection = new TextDisplayBuilder().setContent(
        [
            '## 🎣 Fish & Treasures',
            `> 🐟 Trout: \`${num(items.Trout).toLocaleString('en')}\``,
            `> 🐠 King Salmon: \`${num(items.KingSalmon).toLocaleString('en')}\``,
            `> 🗡️ Swordfish: \`${num(items.SwordFish).toLocaleString('en')}\``,
            `> 🐡 Pufferfish: \`${num(items.PufferFish).toLocaleString('en')}\``,
            `> 💰 Treasure Chests: \`${num(items.Treasure).toLocaleString('en')}\``,
            `> 🏅 Gold Bars: \`${num(items.GoldBar).toLocaleString('en')}\``,
            `> 🔸 Gold Nuggets: \`${num(items.GoldNugget).toLocaleString('en')}\``,
        ].join('\n')
    );

    // Count harvested crops by type (from paid farming system)
    const harvestedCrops = balance.HarvestedCrops ?? [];
    const cornCount = harvestedCrops.filter((c) => c.CropType === 'corn').length;
    const wheatCount = harvestedCrops.filter((c) => c.CropType === 'wheat').length;
    const potatoCount = harvestedCrops.filter((c) => c.CropType === 'potato').length;
    const tomatoCount = harvestedCrops.filter((c) => c.CropType === 'tomato').length;

    // Build crops section based on whether user has farming tools
    const hasFarmingTools = items.FarmingTools;
    const hasFreeCrops =
        num(items.Barley) > 0 ||
        num(items.Lettuce) > 0 ||
        num(items.Strawberries) > 0 ||
        num(items.Spinach) > 0;

    const cropsLines: string[] = ['## 🌾 Harvest & Seeds'];

    // Show paid crops if user has farming tools
    if (hasFarmingTools) {
        // Calculate value and decay for each paid crop type
        const cornCrops = harvestedCrops.filter((c) => c.CropType === 'corn');
        const wheatCrops = harvestedCrops.filter((c) => c.CropType === 'wheat');
        const potatoCrops = harvestedCrops.filter((c) => c.CropType === 'potato');
        const tomatoCrops = harvestedCrops.filter((c) => c.CropType === 'tomato');

        const calcValue = (crops: typeof harvestedCrops, basePrice: number) => {
            return crops.reduce((sum, c) => {
                const value = Math.floor(basePrice * (1 - (c.Decay ?? 0) / 100));
                return sum + value;
            }, 0);
        };

        const calcAvgDecay = (crops: typeof harvestedCrops) => {
            if (crops.length === 0) {
                return 0;
            }
            return crops.reduce((sum, c) => sum + (c.Decay ?? 0), 0) / crops.length;
        };

        const cornValue = calcValue(cornCrops, ecoPrices.farming.rewards.corn);
        const wheatValue = calcValue(wheatCrops, ecoPrices.farming.rewards.wheat);
        const potatoValue = calcValue(potatoCrops, ecoPrices.farming.rewards.potatoes);
        const tomatoValue = calcValue(tomatoCrops, ecoPrices.farming.rewards.tomatoes);

        const cornDecay = calcAvgDecay(cornCrops);
        const wheatDecay = calcAvgDecay(wheatCrops);
        const potatoDecay = calcAvgDecay(potatoCrops);
        const tomatoDecay = calcAvgDecay(tomatoCrops);

        cropsLines.push(
            `> 🌽 Corn: \`${cornCount.toLocaleString('en')}\` - 💰\`${cornValue.toLocaleString('en')}\` - 📉\`${cornDecay.toFixed(2)}%\``,
            `> 🌾 Wheat: \`${wheatCount.toLocaleString('en')}\` - 💰\`${wheatValue.toLocaleString('en')}\` - 📉\`${wheatDecay.toFixed(2)}%\``,
            `> 🥔 Potato: \`${potatoCount.toLocaleString('en')}\` - 💰\`${potatoValue.toLocaleString('en')}\` - 📉\`${potatoDecay.toFixed(2)}%\``,
            `> 🍅 Tomato: \`${tomatoCount.toLocaleString('en')}\` - 💰\`${tomatoValue.toLocaleString('en')}\` - 📉\`${tomatoDecay.toFixed(2)}%\``
        );
    }

    // Show free crops if user doesn't have farming tools OR if they still have some
    if (!hasFarmingTools || hasFreeCrops) {
        // If user has farming tools, only show the free crops they actually have
        if (hasFarmingTools) {
            if (num(items.Barley) > 0) {
                const barleyValue =
                    num(items.Barley) * ecoPrices.farming.farmingWithoutTools.barley;
                cropsLines.push(
                    `> 🌾 Barley: \`${num(items.Barley).toLocaleString('en')}\` - 💰\`${barleyValue.toLocaleString('en')}\``
                );
            }
            if (num(items.Lettuce) > 0) {
                const lettuceValue =
                    num(items.Lettuce) * ecoPrices.farming.farmingWithoutTools.lettuce;
                cropsLines.push(
                    `> 🥬 Lettuce: \`${num(items.Lettuce).toLocaleString('en')}\` - 💰\`${lettuceValue.toLocaleString('en')}\``
                );
            }
            if (num(items.Strawberries) > 0) {
                const strawberriesValue =
                    num(items.Strawberries) * ecoPrices.farming.farmingWithoutTools.strawberries;
                cropsLines.push(
                    `> 🍓 Strawberries: \`${num(items.Strawberries).toLocaleString('en')}\` - 💰\`${strawberriesValue.toLocaleString('en')}\``
                );
            }
            if (num(items.Spinach) > 0) {
                const spinachValue =
                    num(items.Spinach) * ecoPrices.farming.farmingWithoutTools.spinach;
                cropsLines.push(
                    `> 🥗 Spinach: \`${num(items.Spinach).toLocaleString('en')}\` - 💰\`${spinachValue.toLocaleString('en')}\``
                );
            }
        } else {
            // If user doesn't have farming tools, show all free crops with values
            const barleyValue = num(items.Barley) * ecoPrices.farming.farmingWithoutTools.barley;
            const lettuceValue = num(items.Lettuce) * ecoPrices.farming.farmingWithoutTools.lettuce;
            const strawberriesValue =
                num(items.Strawberries) * ecoPrices.farming.farmingWithoutTools.strawberries;
            const spinachValue = num(items.Spinach) * ecoPrices.farming.farmingWithoutTools.spinach;

            cropsLines.push(
                `> 🌾 Barley: \`${num(items.Barley).toLocaleString('en')}\` - 💰\`${barleyValue.toLocaleString('en')}\``,
                `> 🥬 Lettuce: \`${num(items.Lettuce).toLocaleString('en')}\` - 💰\`${lettuceValue.toLocaleString('en')}\``,
                `> 🍓 Strawberries: \`${num(items.Strawberries).toLocaleString('en')}\` - 💰\`${strawberriesValue.toLocaleString('en')}\``,
                `> 🥗 Spinach: \`${num(items.Spinach).toLocaleString('en')}\` - 💰\`${spinachValue.toLocaleString('en')}\``
            );
        }
    }

    // Always show seeds
    cropsLines.push(
        `> 🌽 Corn Seeds: \`${num(items.CornSeeds).toLocaleString('en')}\``,
        `> 🌾 Wheat Seeds: \`${num(items.WheatSeeds).toLocaleString('en')}\``,
        `> 🥔 Potato Seeds: \`${num(items.PotatoSeeds).toLocaleString('en')}\``,
        `> 🍅 Tomato Seeds: \`${num(items.TomatoSeeds).toLocaleString('en')}\``
    );

    const cropsSection = new TextDisplayBuilder().setContent(cropsLines.join('\n'));

    return new ContainerBuilder()
        .addTextDisplayComponents(header)
        .addSeparatorComponents((sep) => sep.setSpacing(SeparatorSpacingSize.Large))
        .addTextDisplayComponents(tools)
        .addSeparatorComponents((sep) => sep.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(boostsSection)
        .addSeparatorComponents((sep) => sep.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(fishSection)
        .addSeparatorComponents((sep) => sep.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(cropsSection)
        .addSeparatorComponents((sep) => sep.setSpacing(SeparatorSpacingSize.Small))
        .addActionRowComponents((row) => row.addComponents(backHome));
}

/**
 * Handle the "View Inventory" button interaction.
 */
export async function handleItems(interaction: ButtonInteraction, homeButton: ButtonBuilder) {
    // Defer to avoid timeout and remove the ephemeral placeholder
    await interaction.deferReply();
    await interaction.deleteReply();

    const balance = await getOrCreateBalance(interaction);

    if (!balance) {
        await RagnarokComponent(
            interaction,
            'Error',
            'No economy profile found. Send a message in this server to create one, then rerun `/economy` → Inventory.',
            true
        );
        return;
    }

    const inventoryContainer = buildInventoryContainer(
        balance,
        interaction.user.displayName,
        homeButton
    );

    await interaction.message?.edit({
        components: [inventoryContainer],
        files: [],
        flags: MessageFlags.IsComponentsV2,
    });
}
