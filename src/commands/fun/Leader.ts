import { Category } from '@discordx/utilities';
import {
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    type CommandInteraction,
    ContainerBuilder,
    type Guild,
    MessageFlags,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import { ButtonComponent, type Client, Discord, Slash } from 'discordx';
import Level from '../../mongo/Level.js';
import LevelConfig from '../../mongo/LevelConfig.js';
import { RagnarokEmbed } from '../../utils/Util.js';

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

        // Navigation row (only show if more than one page)
        if (totalPages > 1) {
            const prevBtn = new ButtonBuilder()
                .setCustomId(`leader:nav:prev:${guild.id}:${Math.max(clampedPage - 1, 0)}`)
                .setLabel('Prev')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(clampedPage === 0);

            const homeBtn = new ButtonBuilder()
                .setCustomId(`leader:nav:home:${guild.id}:0`)
                .setLabel('Home')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(clampedPage === 0);

            const nextBtn = new ButtonBuilder()
                .setCustomId(
                    `leader:nav:next:${guild.id}:${Math.min(clampedPage + 1, totalPages - 1)}`
                )
                .setLabel('Next')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(clampedPage >= totalPages - 1 || allUsers.length === 0);

            container.addActionRowComponents((row) => row.addComponents(prevBtn, homeBtn, nextBtn));
        }

        return container;
    }

    /**
     * Displays the leaderboard for the level system
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @Slash({ description: 'Displays the leaderboard for the level system' })
    async leader(interaction: CommandInteraction, client: Client): Promise<void> {
        const levelDb = await LevelConfig.findOne({ GuildId: interaction.guild!.id });

        if (levelDb) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'The level system is disabled for this guild.',
                true
            );
            return;
        }

        const allUsers = await Level.find({ GuildId: interaction.guild!.id }).sort({ Xp: -1 });

        if (!allUsers || allUsers.length === 0) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'No level data found for this guild.',
                true
            );
            return;
        }

        const container = await this.buildPageContainer(interaction.guild!, allUsers, 0);
        await interaction.reply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    }

    @ButtonComponent({ id: /^leader:nav:.+$/ })
    async onNavigate(interaction: ButtonInteraction): Promise<void> {
        const parts = interaction.customId.split(':');
        // Format: ['leader','nav','<dir>','<guildId>','<page>']
        if (parts.length < 5) {
            await interaction.update({
                components: [
                    new ContainerBuilder().addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('❌ Invalid navigation data.')
                    ),
                ],
                flags: MessageFlags.IsComponentsV2,
            });
            return;
        }

        const guildId = parts[3]!;
        const pageStr = parts[4]!;

        if (guildId !== interaction.guild!.id) {
            await interaction.update({
                components: [
                    new ContainerBuilder().addTextDisplayComponents(
                        new TextDisplayBuilder().setContent('❌ Invalid guild.')
                    ),
                ],
                flags: MessageFlags.IsComponentsV2,
            });
            return;
        }

        const page = Number.parseInt(pageStr, 10);
        const allUsers = await Level.find({ GuildId: guildId }).sort({ Xp: -1 });
        const container = await this.buildPageContainer(
            interaction.guild!,
            allUsers,
            Number.isNaN(page) ? 0 : page
        );
        await interaction.update({ components: [container], flags: MessageFlags.IsComponentsV2 });
    }
}
