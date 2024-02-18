import {
    Client, Discord, Slash, SlashOption,
} from 'discordx';
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Category } from '@discordx/utilities';
import AFKSchema from '../../mongo/schemas/AFK.js';
import { color } from '../../utils/Util.js';

@Discord()
@Category('Fun')
export class AFK {
    /**
     * Allow users to enable AFK mode.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param reason - Optional reason for being AFK
     */
    @Slash({ description: 'Set your AFK status' })
    async afk(
        @SlashOption({
            description: 'Reason for being AFK (optional)',
            name: 'reason',
            type: ApplicationCommandOptionType.String,
        })
            reason: string,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        await AFKSchema.findOneAndUpdate(
            { IdJoined: `${interaction.user.id}-${interaction.guild!.id}` },
            { GuildId: interaction.guild!.id, UserId: interaction.user.id, Reason: reason },
            { upsert: true, new: true },
        );

        const embed = new EmbedBuilder().setColor(color(interaction.guild!.members.me!.displayHexColor)).addFields({
            name: `**${client.user?.username} - AFK**`,
            value: `**Success:** ${interaction.user} is now AFK. Reason:\n\n${reason ?? 'AFK'}`,
        });
        await interaction.reply({ embeds: [embed] });
    }
}
