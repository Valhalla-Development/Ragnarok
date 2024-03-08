import {
    ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, EmbedBuilder,
} from 'discord.js';
import 'colors';
// @ts-expect-error no type file available for this package
import converter from 'number-to-words-en';
import { Client } from 'discordx';
import Balance, { BalanceInterface } from '../mongo/Balance.js';
import { color, RagnarokEmbed } from '../utils/Util.js';

interface EcoPrices {
    Hourly: { min: number; max: number };
    Daily: { min: number; max: number };
    Weekly: { min: number; max: number };
    Monthly: { min: number; max: number };
}

interface Claim {
    Hourly?: number;
    Daily?: number;
    Weekly?: number;
    Monthly?: number;
}

// Buttons to be applied to the embed
const homeButton = new ButtonBuilder()
    .setLabel('Home')
    .setStyle(ButtonStyle.Success)
    .setCustomId('economy_home');

const baltopButton = new ButtonBuilder()
    .setLabel('Baltop')
    .setStyle(ButtonStyle.Primary)
    .setCustomId('economy_baltop');

const claimButton = new ButtonBuilder()
    .setLabel('Claim')
    .setStyle(ButtonStyle.Primary)
    .setCustomId('economy_claim');

const depositButton = new ButtonBuilder()
    .setLabel('Deposit')
    .setStyle(ButtonStyle.Primary)
    .setCustomId('economy_deposit');

const row = new ActionRowBuilder<ButtonBuilder>().addComponents(homeButton, baltopButton, claimButton, depositButton);

function setButtonState(button: ButtonBuilder) {
    [homeButton, baltopButton].forEach((otherButton) => {
        if (otherButton !== button) {
            otherButton.setStyle(ButtonStyle.Primary);
            otherButton.setDisabled(false);
        }
    });

    button.setDisabled(true);
    button.setStyle(ButtonStyle.Success);
}

const ecoPrices = {
    // Amount you earn per message & cooldown
    maxPerM: 40,
    minPerM: 10,
    // Time new users have to wait until using the claim command
    newUserTime: 604800000, // 7 Days

    // Claim amount
    HourlyClaim: {
        min: 50,
        max: 150,
    },
    DailyClaim: {
        min: 150,
        max: 300,
    },
    WeeklyClaim: {
        min: 750,
        max: 1000,
    },
    MonthlyClaim: {
        min: 4000,
        max: 6000,
    },

    // Fishing related prices
    fishBagFirst: 50,
    fishBagLimit: 1000,
    fishBagPrice: 450, // Price is current capacity * price (Upgrade adds 25 to capacity)
    fishingRod: 15000,
    treasure: 50000,
    pufferfish: 3000,
    swordfish: 1500,
    kingSalmon: 500,
    trout: 150,

    // Fishing related timeouts
    fishWinTime: 600000, // 10 Minutes
    fishFailtime: 900000, // 15 Minutes

    // Farming with tools prices
    farmPlotFirst: 10,
    farmPlotLimit: 1000,
    farmPlotPrice: 750, // Price is current capacity * price (Upgrade adds 25 to capacity)
    freeFarmLimit: 10,
    farmingTools: 15000,
    farmBagFirst: 50, // Inital bag purchase
    farmBagLimit: 10000, // Max upgrade possible
    farmBagPrice: 300, // Price is current capacity * price (Upgrade adds 25 to capacity)
    goldBar: 25000,
    corn: 650,
    wheat: 500,
    potatoes: 400,
    tomatoes: 350,

    // Planting Times
    cornPlant: 600000, // 10 minutes
    wheatPlant: 450000, // 7 min 30
    potatoPlant: 210000, // 3 min 30
    tomatoPlant: 90000, // 1 min 30

    // Decay rate
    DecayRate: 0.02,

    // Farming without tools prices
    goldNugget: 15000,
    barley: 1200,
    spinach: 600,
    strawberries: 200,
    lettuce: 60,

    // Farming without tools timeouts
    farmWinTime: 600000, // 10 Minutes
    farmFailTime: 900000, // 15 Minutes,

    // Seed prices
    seedBagFirst: 50, // Inital bag purchase
    seedBagLimit: 1000, // Max upgrade possible
    seedBagPrice: 150, // Price is current capacity * price (Upgrade adds 25 to capacity)
    cornSeed: 4000, // You get 10 per pack
    wheatSeed: 3300,
    potatoSeed: 2900,
    tomatoSeed: 2800,

    // Beg timeout
    begTimer: 120000,
};

/**
 * Access to the home page.
 * @param interaction - The command interaction.
 * @param client - The Discord client.
 */
export async function home(interaction: CommandInteraction | ButtonInteraction, client: Client) {
    const balance = await Balance.findOne({ IdJoined: `${interaction.user.id}-${interaction.guild!.id}` });

    if (!balance) {
        await RagnarokEmbed(client, interaction, 'Error', 'An error occurred, please try again.', true);
        return;
    }

    const userRank = await Balance.find({ GuildId: interaction.guild!.id })
        .sort({ Total: -1 });
    const userPos = userRank.find((b) => b.IdJoined === `${interaction.user.id}-${interaction.guild!.id}`);

    const rankPos = converter.toOrdinal(userRank.indexOf(userPos!) + 1);

    const date = new Date().getTime();

    const itemTypes = new Map<string, string[]>([
        ['seeds', ['CornSeeds', 'WheatSeeds', 'PotatoSeeds', 'TomatoSeeds']],
        ['fish', ['Trout', 'KingSalmon', 'Swordfish', 'Pufferfish']],
        ['crops', ['corn', 'wheat', 'potato', 'tomato']],
    ]);

    const claimUserTime = balance.ClaimNewUser ? Math.round(balance.ClaimNewUser / 1000) : 0;

    function calculateTotal(itemType: string, bal: BalanceInterface): number {
        const types = itemTypes.get(itemType);
        if (!types) return 0; // Handle unknown itemType

        return types.reduce((acc, type) => {
            const itemQuantity = bal?.Items?.[type as keyof typeof bal.Items] || 0;
            return acc + (typeof itemQuantity === 'number' ? itemQuantity : 0);
        }, 0);
    }

    // Sum up seed counts
    const currentTotalSeeds = calculateTotal('seeds', balance);

    // Sum up fish counts
    const currentTotalFish = calculateTotal('fish', balance);

    // Count harvested crops
    const currentTotalFarm = balance.HarvestedCrops?.length
        ? balance.HarvestedCrops.filter((crop) => itemTypes.get('crops')
            ?.includes(crop.CropType)).length : 0;

    const embed = new EmbedBuilder()
        .setAuthor({
            name: `${interaction.user.displayName}'s Balance`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
        })
        .setDescription(`Leaderboard Rank: \`${rankPos}\``)
        .setColor(color(interaction.guild!.members.me!.displayHexColor))
        .addFields(
            {
                name: 'Cash',
                value: `<:coin:706659001164628008> \`${balance.Cash.toLocaleString('en')}\``,
                inline: true,
            },
            {
                name: 'Bank',
                value: `<:coin:706659001164628008> \`${balance.Bank.toLocaleString('en')}\``,
                inline: true,
            },
            {
                name: 'Total',
                value: `<:coin:706659001164628008> \`${balance.Total.toLocaleString('en')}\``,
                inline: true,
            },
            {
                name: 'Cooldowns',
                value: `
                Steal: ${Date.now() > balance.StealCool ? '`Available!`' : `<t:${Math.round(balance.StealCool / 1000)}:R>`}
                Fish: ${!balance.Items?.FishingRod ? '`Rod Not Owned`' : `${Date.now() > balance.FishCool ? '`Available!`' : `<t:${Math.round(balance.FishCool / 1000)}:R>`}`}
                Farm: ${Date.now() > balance.FarmCool ? '`Available!`' : `<t:${Math.round(balance.FarmCool / 1000)}:R>`}
            `,
                inline: false,
            },
            {
                name: 'Boosts',
                value: `
                Seed: ${balance.Boosts?.SeedBag ? `\`${Number(currentTotalSeeds)
        .toLocaleString('en')}/${Number(balance.Boosts.SeedBag)
        .toLocaleString('en')}\`` : '`Seed Not Owned`'}
                Fish: ${balance.Boosts?.FishBag ? `\`${Number(currentTotalFish)
        .toLocaleString('en')}/${Number(balance.Boosts.FishBag)
        .toLocaleString('en')}\`` : '`Fish Not Owned`'}
                Farm: ${balance.Boosts?.FarmBag ? `\`${Number(currentTotalFarm)
        .toLocaleString('en')}/${Number(balance.Boosts.FarmBag)
        .toLocaleString('en')}\`` : '`Farm Not Owned`'}
                Farm Plot: ${balance.Boosts?.FarmPlot ? `\`${balance.FarmPlot.length.toLocaleString('en')}/${Number(balance.Boosts.FarmPlot)
        .toLocaleString('en')}\`` : '`Not Owned`'}
            `,
                inline: false,
            },
            {
                name: '**Claim Cooldowns**',
                value: `
                Hourly: ${balance.ClaimNewUser ? (Date.now() > balance.ClaimNewUser ? '`Available`' : `<t:${claimUserTime}:R>`) : (Date.now() > balance.Hourly ? '`Available!`' : `<t:${Math.round(balance.Hourly / 1000)}:R>`)}
                Daily: ${balance.ClaimNewUser ? (Date.now() > balance.ClaimNewUser ? '`Available`' : `<t:${claimUserTime}:R>`) : (Date.now() > balance.Daily ? '`Available!`' : `<t:${Math.round(balance.Daily / 1000)}:R>`)}
                Weekly: ${balance.ClaimNewUser ? (Date.now() > balance.ClaimNewUser ? '`Available`' : `<t:${claimUserTime}:R>`) : (Date.now() > balance.Weekly ? '`Available!`' : `<t:${Math.round(balance.Weekly / 1000)}:R>`)}
                Monthly: ${balance.ClaimNewUser ? (Date.now() > balance.ClaimNewUser ? '`Available`' : `<t:${claimUserTime}:R>`) : (Date.now() > balance.Monthly ? '`Available!`' : `<t:${Math.round(balance.Monthly / 1000)}:R>`)}
            `,
            },
        );

    setButtonState(homeButton);

    if (interaction instanceof ButtonInteraction) {
        await interaction.deferReply();
        await interaction.deleteReply();

        await interaction.message.edit({ embeds: [embed], components: [row] });
    } else {
        await interaction.reply({ embeds: [embed], components: [row] });
    }
}

/**
 * View the economy leaderboard for the guild.
 * @param interaction - The command interaction.
 * @param client - The Discord client.
 */
export async function baltop(interaction: ButtonInteraction, client: Client) {
    const top10 = await Balance.find({ GuildId: interaction.guild!.id })
        .sort({ Total: -1 })
        .limit(10);

    if (!top10 || top10.length === 0) {
        await RagnarokEmbed(client, interaction, 'Error', 'No data found.', true);
        return;
    }

    await interaction.deferReply();
    await interaction.deleteReply();

    let userNames: string = '';
    let balance: string = '';

    await Promise.all(top10.map(async (data, index) => {
        let fetchUser = interaction.guild!.members.cache.get(data.UserId);

        if (!fetchUser) {
            try {
                fetchUser = await interaction.guild!.members.fetch(data.UserId);
            } catch {
            // Do nothing because I am a monster
            }
        }

        if (fetchUser) {
            userNames += `\`${index + 1}\` ${fetchUser}\n`;

            balance += `<:coin:706659001164628008> \`${data.Total}\`\n`;
        }
    }));

    const embed = new EmbedBuilder()
        .setAuthor({
            name: `Leaderboard for ${interaction.guild!.name}`,
            iconURL: `${interaction.guild!.iconURL({ extension: 'png' })}`,
        })
        .setColor(color(interaction.guild!.members.me!.displayHexColor))
        .addFields(
            {
                name: 'Top 10',
                value: userNames,
                inline: true,
            },
            {
                name: 'Balance',
                value: balance,
                inline: true,
            },
        );

    setButtonState(baltopButton);

    await interaction.message.edit({ embeds: [embed], components: [row] });
}

/**
 * Deposit your balance into the bank
 * @param interaction - The command interaction.
 * @param client - The Discord client.
 */
export async function deposit(interaction: ButtonInteraction, client: Client) {
    const balance = await Balance.findOne({ IdJoined: `${interaction.user.id}-${interaction.guild!.id}` });

    if (!balance || balance.Cash === 0) {
        await RagnarokEmbed(client, interaction, 'Error', 'You do not have any cash to deposit.', true);
        return;
    }

    const bankCalc = balance.Cash + balance.Bank;

    await RagnarokEmbed(client, interaction, 'Success', `You have deposited <:coin:706659001164628008> \`${balance.Cash.toLocaleString('en')}\` to your bank.`, true);

    balance.Cash = 0;
    balance.Bank = bankCalc;
    balance.Total = bankCalc;

    await balance.save();
}

/**
 * Claim rewards
 * @param interaction - The command interaction.
 * @param client - The Discord client.
 */
export async function claim(interaction: ButtonInteraction, client: Client) {
    const balance = await Balance.findOne({ IdJoined: `${interaction.user.id}-${interaction.guild!.id}` });

    if (!balance) {
        await RagnarokEmbed(client, interaction, 'Error', 'An error occurred, please try again.', true);
        return;
    }

    if (balance.ClaimNewUser) {
        if (Date.now() > balance.ClaimNewUser) {
            balance.ClaimNewUser = 0;
        } else {
            const nowInSecond = Math.round(balance.ClaimNewUser / 1000);

            await RagnarokEmbed(client, interaction, 'Error', `Your Economy proifle is too new! Please wait another <t:${nowInSecond}:R> before using this command.`, true);
            return;
        }
    }

    const keys:(keyof Claim)[] = ['Hourly', 'Daily', 'Weekly', 'Monthly'];

    keys.forEach((key) => {
        if (balance[key] && Date.now() > balance[key]) {
            balance[key] = 0;
        }
    });

    if (Date.now() < Math.min(balance.Hourly, balance.Daily, balance.Weekly, balance.Monthly)) {
        await RagnarokEmbed(client, interaction, 'Error', ' You have nothing to claim!', true);
        return;
    }

    let fullPrice = 0;

    const periods = ['Hourly', 'Daily', 'Weekly', 'Monthly'];
    const prices: EcoPrices = {
        Hourly: ecoPrices.HourlyClaim,
        Daily: ecoPrices.DailyClaim,
        Weekly: ecoPrices.WeeklyClaim,
        Monthly: ecoPrices.MonthlyClaim,
    };

    periods.forEach((period) => {
        if (!balance[period as keyof typeof balance]) {
            const priceRange = prices[period as keyof EcoPrices];
            fullPrice += Math.floor(Math.random() * (priceRange.max - priceRange.min + 1)) + priceRange.min;
        }
    });

    if (!balance.Hourly) {
        fullPrice
                += Math.floor(Math.random() * ecoPrices.HourlyClaim.max - ecoPrices.HourlyClaim.min + 1)
                + ecoPrices.HourlyClaim.min;
    }
    if (!balance.Daily) {
        fullPrice
                += Math.floor(Math.random() * ecoPrices.DailyClaim.max - ecoPrices.DailyClaim.min + 1)
                + ecoPrices.DailyClaim.min;
    }
    if (!balance.Weekly) {
        fullPrice
                += Math.floor(Math.random() * ecoPrices.WeeklyClaim.max - ecoPrices.WeeklyClaim.min + 1)
                + ecoPrices.WeeklyClaim.min;
    }
    if (!balance.Monthly) {
        fullPrice
                += Math.floor(Math.random() * ecoPrices.MonthlyClaim.max - ecoPrices.MonthlyClaim.min + 1)
                + ecoPrices.MonthlyClaim.min;
    }

    const endTime = new Date().getTime();

    balance.Hourly = !balance.Hourly ? endTime + 3600000 : balance.Hourly;
    balance.Daily = !balance.Daily ? endTime + 86400000 : balance.Daily;
    balance.Weekly = !balance.Weekly ? endTime + 604800000 : balance.Weekly;
    balance.Monthly = !balance.Monthly ? endTime + 2629800000 : balance.Monthly;
    balance.Bank += fullPrice;
    balance.Total += fullPrice;

    await balance.save();

    const newTot = balance.Total + fullPrice;

    await RagnarokEmbed(client, interaction, 'Success', `You have claimed all available claims! <:coin:706659001164628008> \`${fullPrice.toLocaleString('en')}\` has been credited to your Bank.\n Your new total is <:coin:706659001164628008> \`${newTot.toLocaleString('en')}\``, true);
}
