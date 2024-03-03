import { Client, Discord, Slash } from 'discordx';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { Category } from '@discordx/utilities';
import Level from '../../mongo/Level';
import LevelConfig from '../../mongo/LevelConfig';
import { color, RagnarokEmbed } from '../../utils/Util.js';

@Discord()
@Category('Fun')
export class Leader {
    /**
     * Displays the leaderboard for the level system
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param user - Optional user to fetch
     */
    @Slash({ description: 'Displays the leaderboard for the level system' })
    async leader(interaction: CommandInteraction, client: Client): Promise<void> {
        const levelDb = await LevelConfig.findOne({ GuildId: interaction.guild!.id });

        if (levelDb) {
            await RagnarokEmbed(client, interaction, 'Error', 'The level system is disabled for this guild.', true);
            return;
        }

        const top10 = await Level.find({ GuildId: interaction.guild!.id })
            .sort({ Xp: -1 })
            .limit(10);

        if (!top10 || top10.length === 0) {
            return;
        }

        let userNames: string = '';
        let levels: string = '';
        let xp: string = '';

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
                userNames += `◎ \`${top10.length - index}\` ${fetchUser}\n`;

                levels += `\`${data.Level}\`\n`;

                xp += `\`${data.Xp.toLocaleString('en')}\`\n`;
            }
        }));

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Leaderboard for ${interaction.guild!.name}`, iconURL: `${interaction.guild!.iconURL({ extension: 'png' })}` })
            .setColor(color(interaction.guild!.members.me!.displayHexColor))
            .addFields(
                { name: 'Top 10', value: userNames, inline: true },
                { name: 'Level', value: levels, inline: true },
                { name: 'XP', value: xp, inline: true },
            );
        await interaction.reply({ embeds: [embed] });
    }
}
