import {
    ApplicationCommandType,
    AttachmentBuilder,
    type GuildMember,
    type UserContextMenuCommandInteraction,
} from 'discord.js';
import { type Client, ContextMenu, Discord } from 'discordx';
import { RagnarokEmbed } from '../utils/Util.js';

@Discord()
export class AvatarContext {
    /**
     * Displays avatar for the author of the interaction or a specified user
     * @param interaction - The command interaction
     * @param client - The Discord client.
     */
    @ContextMenu({
        name: 'Avatar',
        type: ApplicationCommandType.User,
    })
    async avatarContext(
        interaction: UserContextMenuCommandInteraction,
        client: Client
    ): Promise<void> {
        const member = interaction.targetMember as GuildMember;

        try {
            await member.fetch();

            const avatar = member.user.displayAvatarURL({ size: 1024 });

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

            const attachment = new AttachmentBuilder(avatar);

            await interaction.reply({
                files: [attachment],
            });
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
