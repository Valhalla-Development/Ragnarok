import {
    ApplicationCommandType,
    AttachmentBuilder,
    type GuildMember,
    type UserContextMenuCommandInteraction,
} from 'discord.js';
import { ContextMenu, Discord } from 'discordx';
import { RagnarokComponent } from '../utils/Util.js';

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
    async bannerAvatar(interaction: UserContextMenuCommandInteraction): Promise<void> {
        const member = interaction.targetMember as GuildMember;

        try {
            await member.fetch();

            const banner = member.user.bannerURL({ size: 1024 });

            if (!banner) {
                await RagnarokComponent(
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
            await RagnarokComponent(
                interaction,
                'Error',
                `An error occurred fetching ${member}'s banner`,
                true
            );
        }
    }
}
