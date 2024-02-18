import {
    Client, Discord, Slash, SlashOption,
} from 'discordx';
import {
    ApplicationCommandOptionType, CommandInteraction, EmbedBuilder, GuildMember,
} from 'discord.js';
import { Category } from '@discordx/utilities';
import { color } from '../../utils/Util.js';

@Discord()
@Category('Fun')
export class Avatar {
    /**
     * Displays avatar for the author of the interaction or a specified user.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param user - Optional user to fetch
     */
    @Slash({ description: 'Displays avatar for the author of the interaction or a specified user.' })
    async avatar(
        @SlashOption({
            description: 'User to fetch (optional)',
            name: 'user',
            type: ApplicationCommandOptionType.User,
        })
            user: GuildMember,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        const member = user || interaction.member;

        try {
            await member.fetch();

            const avatar = member.user.displayAvatarURL({ size: 2048 });

            if (!avatar) {
                const embed = new EmbedBuilder()
                    .setColor(color(interaction.guild!.members.me!.displayHexColor))
                    .addFields({ name: `**${client.user?.username} - Avatar**`, value: `**◎ Error:** ${member} does not have an avatar set.` });
                await interaction.reply({ ephemeral: true, embeds: [embed] });
                return;
            }

            const embed = new EmbedBuilder()
                .setAuthor({ name: `${member.displayName}'s Avatar`, iconURL: avatar })
                .setImage(avatar)
                .setColor(color(interaction.guild!.members.me!.displayHexColor));
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .addFields({ name: `**${client.user?.username} - Avatar**`, value: `**◎ Error:** An error occurred fetching ${member}'s avatar` });
            await interaction.reply({ ephemeral: true, embeds: [embed] });
        }
    }
}
