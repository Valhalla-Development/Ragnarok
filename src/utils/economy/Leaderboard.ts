import {
    type ButtonBuilder,
    type ButtonInteraction,
    ContainerBuilder,
    MessageFlags,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import type { Client } from 'discordx';
import Balance, { type BalanceInterface } from '../../mongo/Balance.js';
import { RagnarokEmbed } from '../Util.js';

/**
 * Asynchronously handles the baltop button interaction.
 * @param interaction - The ButtonInteraction triggering the baltop function.
 * @param client - The Discord client.
 * @param homeButton - The home button to display
 */
export async function handleBaltop(
    interaction: ButtonInteraction,
    client: Client,
    homeButton: ButtonBuilder
) {
    // Fetch top 10 balances from the database sorted by total balance
    const top10: BalanceInterface[] = await Balance.find({ GuildId: interaction.guild!.id })
        .sort({ Total: -1 })
        .limit(10);

    // If no data found, show an error message and return
    if (!top10 || top10.length === 0) {
        await RagnarokEmbed(client, interaction, 'Error', 'No data found.', true);
        return;
    }

    // Defer the original reply to prevent timeout and delete the original reply
    await interaction.deferReply();
    await interaction.deleteReply();

    // Build leaderboard content
    let leaderboardContent = '';

    // Iterate over the top 10 balances and fetch corresponding member data
    await Promise.all(
        top10.map(async (data, index: number) => {
            let fetchUser = interaction.guild!.members.cache.get(data.UserId);

            if (!fetchUser) {
                try {
                    fetchUser = await interaction.guild!.members.fetch(data.UserId);
                } catch {
                    // Do nothing because I am a monster
                }
            }

            // If user data is found, build leaderboard entry
            if (fetchUser) {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
                leaderboardContent += `> ${medal} **#${index + 1}** ${fetchUser.displayName} - \`${data.Total.toLocaleString('en')}\` <:coin:706659001164628008>\n`;
            }
        })
    );

    // Construct the container with leaderboard information
    const embed = new ContainerBuilder()
        .addTextDisplayComponents(new TextDisplayBuilder().setContent('## 💎 **Hall of Fame**'))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(leaderboardContent.trim()))
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addActionRowComponents((row) => row.addComponents(homeButton));

    // Update the original message with the updated embed and components
    await interaction.message.edit({
        embeds: [],
        files: [],
        components: [embed],
        flags: MessageFlags.IsComponentsV2,
    });
}
