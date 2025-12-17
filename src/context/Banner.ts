import {
    ApplicationCommandType,
    AttachmentBuilder,
    type GuildMember,
    type UserContextMenuCommandInteraction,
} from 'discord.js';
import { type Client, ContextMenu, Discord } from 'discordx';
import { RagnarokEmbed } from '../utils/Util.js';

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

            const banner = member.user.bannerURL({ size: 1024 });

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

            const attachment = new AttachmentBuilder(banner);

            await interaction.reply({
                files: [attachment],
            });
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
