import { Category } from '@discordx/utilities';
import {
    ApplicationCommandOptionType,
    type CommandInteraction,
    EmbedBuilder,
    type GuildMember,
} from 'discord.js';
import { type Client, Discord, Slash, SlashOption } from 'discordx';
import { RagnarokEmbed, color } from '../../utils/Util.js';

@Discord()
@Category('Fun')
export class Avatar {
    /**
     * Displays avatar for the author of the interaction or a specified user.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param user - Optional user to fetch
     */
    @Slash({
        description: 'Displays avatar for the author of the interaction or a specified user.',
    })
    async avatar(
        @SlashOption({
            description: 'User to fetch (optional)',
            name: 'user',
            type: ApplicationCommandOptionType.User,
        })
        user: GuildMember,
        interaction: CommandInteraction,
        client: Client
    ): Promise<void> {
        const member = user || interaction.member;

        try {
            await member.fetch();

            const avatar = member.user.displayAvatarURL({ size: 2048 });

            if (!avatar) {
                await RagnarokEmbed(
                    client,
                    interaction,
                    'Error',
                    `${member} does not have an avatar set.`,
                    true
                );
                return;
            }

            const embed = new EmbedBuilder()
                .setAuthor({ name: `${member.displayName}'s Avatar`, iconURL: avatar })
                .setImage(avatar)
                .setColor(color(interaction.guild?.members.me?.displayHexColor ?? '#5865F2'));
            await interaction.reply({ embeds: [embed] });
        } catch (_error) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                `An error occurred fetching ${member}'s avatar`,
                true
            );
        }
    }
}
