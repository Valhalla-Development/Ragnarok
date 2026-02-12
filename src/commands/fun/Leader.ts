import { Category } from '@discordx/utilities';
import {
    type CommandInteraction,
    ContainerBuilder,
    type Guild,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import { Discord, Slash } from 'discordx';
import Level from '../../mongo/Level.js';
import LevelConfig from '../../mongo/LevelConfig.js';
import { paginationComponentsV2, RagnarokComponent } from '../../utils/Util.js';

@Discord()
@Category('Fun')
export class Leader {
    private static readonly USERS_PER_PAGE: number = 10;

    private async buildPageContainer(
        guild: Guild,
        allUsers: Array<{ UserId: string; Level: number; Xp: number }>,
        pageIndex: number
    ): Promise<ContainerBuilder> {
        const totalPages = Math.max(1, Math.ceil(allUsers.length / Leader.USERS_PER_PAGE));
        const clampedPage = Math.min(Math.max(0, pageIndex), totalPages - 1);
        const start = clampedPage * Leader.USERS_PER_PAGE;
        const pageUsers = allUsers.slice(start, start + Leader.USERS_PER_PAGE);

        let leaderboardContent = '';

        await Promise.all(
            pageUsers.map(async (data, index) => {
                const globalIndex = start + index;

                let fetchUser = guild.members.cache.get(data.UserId);

                if (!fetchUser) {
                    try {
                        fetchUser = await guild.members.fetch(data.UserId);
                    } catch {
                        // Do nothing because I am a monster
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
                    leaderboardContent += `\u3000\u3000📊 Level \`${data.Level}\` • ⚡ XP \`${data.Xp.toLocaleString('en')}\`\n\n`;
                }
            })
        );

        const header = new TextDisplayBuilder().setContent(
            [
                '# 🏆 Leaderboard',
                '',
                totalPages > 1 ? `> Page: ${clampedPage + 1}/${totalPages}` : '',
            ].join('\n')
        );

        const container = new ContainerBuilder()
            .addTextDisplayComponents(header)
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(leaderboardContent.trim())
            );

        return container;
    }

    /**
     * Displays the leaderboard for the level system
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @Slash({ description: 'Displays the leaderboard for the level system' })
    async leader(interaction: CommandInteraction): Promise<void> {
        const levelDb = await LevelConfig.findOne({ GuildId: interaction.guild!.id });

        if (levelDb) {
            await RagnarokComponent(
                interaction,
                'Error',
                'The level system is disabled for this guild.',
                true
            );
            return;
        }

        const allUsers = await Level.find({ GuildId: interaction.guild!.id }).sort({ Xp: -1 });
        const mappedUsers = allUsers.map((row) => ({
            UserId: row.UserId ?? '',
            Level: Number(row.Level ?? 0),
            Xp: Number(row.Xp ?? 0),
        }));

        if (!allUsers || allUsers.length === 0) {
            await RagnarokComponent(
                interaction,
                'Error',
                'No level data found for this guild.',
                true
            );
            return;
        }

        const totalPages = Math.max(1, Math.ceil(mappedUsers.length / Leader.USERS_PER_PAGE));
        await paginationComponentsV2(
            interaction,
            async (page) => this.buildPageContainer(interaction.guild!, mappedUsers, page),
            totalPages
        );
    }
}
