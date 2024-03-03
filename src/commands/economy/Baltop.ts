import { Client, Discord, Slash } from 'discordx';
import { CommandInteraction, EmbedBuilder } from 'discord.js';
import { Category } from '@discordx/utilities';
import Balance from '../../mongo/Balance.js';
import { color } from '../../utils/Util.js';

@Discord()
@Category('Economy')
export class Baltop {
    /**
     * View the economy leaderboard for the guild.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @Slash({ description: 'Access to the economy module' })
    async baltop(interaction: CommandInteraction, client: Client): Promise<void> {
        const top10 = await Balance.find({ GuildId: interaction.guild!.id })
            .sort({ Total: -1 })
            .limit(10);

        if (!top10 || top10.length === 0) {
            return;
        }

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
        await interaction.reply({ embeds: [embed] });
    }
}
