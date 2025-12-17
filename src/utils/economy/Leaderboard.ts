import {
    ButtonBuilder,
    type ButtonBuilder as ButtonBuilderType,
    type ButtonInteraction,
    ButtonStyle,
    ContainerBuilder,
    MessageFlags,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import Balance from '../../mongo/Balance.js';
import { RagnarokComponent } from '../Util.js';

const USERS_PER_PAGE = 10;

/**
 * Asynchronously handles the baltop button interaction.
 * @param interaction - The ButtonInteraction triggering the baltop function.
 * @param client - The Discord client.
 * @param homeButton - The home button to display
 * @param pageIndex - The page index to display (default 0)
 */
export async function handleBaltop(
    interaction: ButtonInteraction,
    homeButton: ButtonBuilderType,
    pageIndex = 0
) {
    // Fetch all balances from the database sorted by total balance
    const allUsers = await Balance.find({ GuildId: interaction.guild!.id }).sort({ Total: -1 });

    // If no data found, show an error message and return
    if (!allUsers || allUsers.length === 0) {
        await RagnarokComponent(interaction, 'Error', 'No data found.', true);
        return;
    }

    // Defer the original reply to prevent timeout and delete the original reply
    await interaction.deferReply();
    await interaction.deleteReply();

    const totalPages = Math.max(1, Math.ceil(allUsers.length / USERS_PER_PAGE));
    const clampedPage = Math.min(Math.max(0, pageIndex), totalPages - 1);
    const start = clampedPage * USERS_PER_PAGE;
    const pageUsers = allUsers.slice(start, start + USERS_PER_PAGE);

    // Build leaderboard content
    let leaderboardContent = '';

    // Iterate over the page users and fetch corresponding member data
    await Promise.all(
        pageUsers.map(async (data, index: number) => {
            const globalIndex = start + index;
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
                const medal =
                    globalIndex === 0
                        ? '🥇'
                        : globalIndex === 1
                          ? '🥈'
                          : globalIndex === 2
                            ? '🥉'
                            : '🔹';
                leaderboardContent += `${medal} **#${globalIndex + 1}** ${fetchUser}\n`;
                leaderboardContent += `\u3000\u3000💰 \`${data.Total.toLocaleString('en')}\` <:coin:706659001164628008>\n\n`;
            }
        })
    );

    const header = new TextDisplayBuilder().setContent(
        [
            '# 💎 Hall of Fame',
            '',
            totalPages > 1 ? `> Page: ${clampedPage + 1}/${totalPages}` : '',
        ].join('\n')
    );

    // Construct the container with leaderboard information
    const container = new ContainerBuilder()
        .addTextDisplayComponents(header)
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(new TextDisplayBuilder().setContent(leaderboardContent.trim()));

    // Add navigation buttons if more than one page
    if (totalPages > 1) {
        const prevBtn = new ButtonBuilder()
            .setCustomId(`baltop:nav:prev:${interaction.guild!.id}:${Math.max(clampedPage - 1, 0)}`)
            .setLabel('Prev')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(clampedPage === 0);

        const homeNavBtn = new ButtonBuilder()
            .setCustomId(`baltop:nav:home:${interaction.guild!.id}:0`)
            .setLabel('Home')
            .setStyle(ButtonStyle.Primary)
            .setDisabled(clampedPage === 0);

        const nextBtn = new ButtonBuilder()
            .setCustomId(
                `baltop:nav:next:${interaction.guild!.id}:${Math.min(clampedPage + 1, totalPages - 1)}`
            )
            .setLabel('Next')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(clampedPage >= totalPages - 1 || allUsers.length === 0);

        container
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
            .addActionRowComponents((row) => row.addComponents(prevBtn, homeNavBtn, nextBtn));
    }

    container
        .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
        .addActionRowComponents((row) => row.addComponents(homeButton));

    // Update the original message with the updated embed and components
    await interaction.message.edit({
        embeds: [],
        files: [],
        components: [container],
        flags: MessageFlags.IsComponentsV2,
    });
}
