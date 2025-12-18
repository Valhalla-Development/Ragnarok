import { Category } from '@discordx/utilities';
import {
    ApplicationCommandOptionType,
    AttachmentBuilder,
    type CommandInteraction,
    type GuildMember,
} from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { RagnarokComponent } from '../../utils/Util.js';

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
            required: false,
        })
        user: GuildMember | null,
        interaction: CommandInteraction
    ): Promise<void> {
        const member = user || (interaction.member as GuildMember | null);
        if (!member) {
            await RagnarokComponent(interaction, 'Error', 'Could not find member.', true);
            return;
        }

        try {
            await member.fetch();

            const avatar = member.user.displayAvatarURL({ size: 1024 });

            if (!avatar) {
                await RagnarokComponent(
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
            await RagnarokComponent(
                interaction,
                'Error',
                `An error occurred fetching ${member}'s avatar`,
                true
            );
        }
    }
}
