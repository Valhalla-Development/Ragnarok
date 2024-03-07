import {
    ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, EmbedBuilder,
} from 'discord.js';
import 'colors';
// @ts-expect-error no type file available for this package
import converter from 'number-to-words-en';
import ms from 'ms';
import { Client } from 'discordx';
import Balance, { BalanceInterface } from '../mongo/Balance.js';
import { color, RagnarokEmbed } from '../utils/Util.js';

// Buttons to be applied to the embed
const homeButton = new ButtonBuilder()
    .setLabel('Home')
    .setStyle(ButtonStyle.Success)
    .setCustomId('economy_home');

const baltopButton = new ButtonBuilder()
    .setLabel('Baltop')
    .setStyle(ButtonStyle.Primary)
    .setCustomId('economy_baltop');

const row = new ActionRowBuilder<ButtonBuilder>().addComponents(homeButton, baltopButton);

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
                Steal: ${Date.now() > balance.StealCool ? '`Available!`' : `\`${ms(balance.StealCool - date, { long: true })}\``}
                Fish: ${!balance.Items?.FishingRod ? '`Rod Not Owned`' : `${Date.now() > balance.FishCool ? '`Available!`' : `\`${ms(balance.FishCool - date, { long: true })}\``}`}
                Farm: ${Date.now() > balance.FarmCool ? '`Available!`' : `\`${ms(balance.FarmCool - date, { long: true })}\``}
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
                Hourly: ${balance.ClaimNewUser ? (Date.now() > balance.ClaimNewUser ? '`Available`' : `<t:${claimUserTime}:R>`) : (Date.now() > balance.Hourly ? '`Available!`' : `\`${ms(balance.Hourly - date, { long: true })}\``)}
                Daily: ${balance.ClaimNewUser ? (Date.now() > balance.ClaimNewUser ? '`Available`' : `<t:${claimUserTime}:R>`) : (Date.now() > balance.Daily ? '`Available!`' : `\`${ms(balance.Daily - date, { long: true })}\``)}
                Weekly: ${balance.ClaimNewUser ? (Date.now() > balance.ClaimNewUser ? '`Available`' : `<t:${claimUserTime}:R>`) : (Date.now() > balance.Weekly ? '`Available!`' : `\`${ms(balance.Weekly - date, { long: true })}\``)}
                Monthly: ${balance.ClaimNewUser ? (Date.now() > balance.ClaimNewUser ? '`Available`' : `<t:${claimUserTime}:R>`) : (Date.now() > balance.Monthly ? '`Available!`' : `\`${ms(balance.Monthly - date, { long: true })}\``)}
            `,
            },
        );

    homeButton.setDisabled(true);
    homeButton.setStyle(ButtonStyle.Success);
    baltopButton.setDisabled(false);
    baltopButton.setStyle(ButtonStyle.Primary);

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

    homeButton.setDisabled(false);
    homeButton.setStyle(ButtonStyle.Primary);
    baltopButton.setDisabled(true);
    baltopButton.setStyle(ButtonStyle.Success);

    await interaction.message.edit({ embeds: [embed], components: [row] });
}
