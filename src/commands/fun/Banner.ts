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
export class Banner {
    /**
     * Display guild members banner
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param user - Optional user to fetch
     */
    @Slash({ description: 'Display guild members banner' })
    async banner(
        @SlashOption({
            description: 'Optional user to fetch',
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

            const banner = member.user.bannerURL({ size: 2048 });

            if (!banner) {
                const embed = new EmbedBuilder()
                    .setColor(color(interaction.guild!.members.me!.displayHexColor))
                    .addFields({ name: `**${client.user?.username} - Banner**`, value: `**◎ Error:** ${member} does not have a banner set.` });
                await interaction.reply({ ephemeral: true, embeds: [embed] });
                return;
            }

            const embed = new EmbedBuilder()
                .setAuthor({ name: `${member.displayName}'s Banner`, iconURL: banner })
                .setImage(banner)
                .setColor(color(interaction.guild!.members.me!.displayHexColor));
            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            const embed = new EmbedBuilder()
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .addFields({ name: `**${client.user?.username} - Banner**`, value: `**◎ Error:** An error occurred fetching ${member}` });
            await interaction.reply({ ephemeral: true, embeds: [embed] });
        }
    }
}
