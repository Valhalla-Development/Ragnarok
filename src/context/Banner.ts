import {
    ApplicationCommandType,
    EmbedBuilder,
    type GuildMember,
    type UserContextMenuCommandInteraction,
} from 'discord.js';
import { type Client, ContextMenu, Discord } from 'discordx';
import { RagnarokEmbed, color } from '../utils/Util.js';

@Discord()
export class BannerContext {
    /**
     * Display guild member's banner
     * @param interaction - The command interaction
     * @param client - The Discord client.
     */
    @ContextMenu({
        name: 'Banner',
        type: ApplicationCommandType.User,
    })
    async bannerAvatar(
        interaction: UserContextMenuCommandInteraction,
        client: Client
    ): Promise<void> {
        const member = interaction.targetMember as GuildMember;

        try {
            await member.fetch();

            const banner = member.user.bannerURL({ size: 2048 });

            if (!banner) {
                await RagnarokEmbed(
                    client,
                    interaction,
                    'Error',
                    `${member} does not have a banner set.`,
                    true
                );
                return;
            }

            const embed = new EmbedBuilder()
                .setAuthor({ name: `${member.displayName}'s Banner`, iconURL: banner })
                .setImage(banner)
                .setColor(color(interaction.guild?.members.me?.displayHexColor ?? '#5865F2'));
            await interaction.reply({ embeds: [embed] });
        } catch (_error) {
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                `An error occurred fetching ${member}'s banner`,
                true
            );
        }
    }
}
