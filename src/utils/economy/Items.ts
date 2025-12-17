import type { ButtonInteraction } from 'discord.js';
import {
    ButtonBuilder,
    ContainerBuilder,
    MessageFlags,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import type { Client } from 'discordx';
import type { BalanceInterface } from '../../mongo/Balance.js';
import Balance from '../../mongo/Balance.js';
import { RagnarokEmbed } from '../Util.js';

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
                    ? `\`${(
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

    const cropsSection = new TextDisplayBuilder().setContent(
        [
            '## 🌾 Harvest & Seeds',
            `> 🌾 Barley: \`${num(items.Barley).toLocaleString('en')}\``,
            `> 🥬 Lettuce: \`${num(items.Lettuce).toLocaleString('en')}\``,
            `> 🍓 Strawberries: \`${num(items.Strawberries).toLocaleString('en')}\``,
            `> 🥗 Spinach: \`${num(items.Spinach).toLocaleString('en')}\``,
            `> 🌽 Corn Seeds: \`${num(items.CornSeeds).toLocaleString('en')}\``,
            `> 🌾 Wheat Seeds: \`${num(items.WheatSeeds).toLocaleString('en')}\``,
            `> 🥔 Potato Seeds: \`${num(items.PotatoSeeds).toLocaleString('en')}\``,
            `> 🍅 Tomato Seeds: \`${num(items.TomatoSeeds).toLocaleString('en')}\``,
        ].join('\n')
    );

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
export async function handleItems(
    interaction: ButtonInteraction,
    client: Client,
    homeButton: ButtonBuilder
) {
    // Defer to avoid timeout and remove the ephemeral placeholder
    await interaction.deferReply();
    await interaction.deleteReply();

    const balance = await Balance.findOne({
        IdJoined: `${interaction.user.id}-${interaction.guild!.id}`,
    });

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
