import {
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    ContainerBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import Balance from '../../mongo/Balance.js';
import { paginationComponentsV2, RagnarokComponent } from '../Util.js';

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
    homeButton: ButtonBuilder,
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

    const buildPage = async (page: number) => {
        const clampedPage = Math.min(Math.max(0, page), totalPages - 1);
        const start = clampedPage * USERS_PER_PAGE;
        const pageUsers = allUsers.slice(start, start + USERS_PER_PAGE);

        let leaderboardContent = '';

        await Promise.all(
            pageUsers.map(async (data, index: number) => {
                const globalIndex = start + index;
                let fetchUser = interaction.guild!.members.cache.get(data.UserId);

                if (!fetchUser) {
                    try {
                        fetchUser = await interaction.guild!.members.fetch(data.UserId);
                    } catch {
                        // ignore
                    }
                }

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
                    leaderboardContent += `\u3000\u3000💰 \`${data.Total.toLocaleString('en')}\`\n\n`;
                }
            })
        );

        const backButton = ButtonBuilder.from(homeButton.toJSON())
            .setDisabled(false)
            .setStyle(ButtonStyle.Primary);

        const header = new TextDisplayBuilder().setContent(
            [
                '# 💎 Hall of Fame',
                '',
                totalPages > 1 ? `> Page: ${clampedPage + 1}/${totalPages}` : '',
            ].join('\n')
        );

        const container = new ContainerBuilder()
            .addTextDisplayComponents(header)
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(leaderboardContent.trim())
            )
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
            .addActionRowComponents((row) => row.addComponents(backButton));

        return container;
    };

    await paginationComponentsV2(interaction, buildPage, totalPages, { initialPage: pageIndex });
}
