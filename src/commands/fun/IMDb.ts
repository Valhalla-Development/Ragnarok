import { Category } from '@discordx/utilities';
import {
    ApplicationCommandOptionType,
    ButtonBuilder,
    ButtonStyle,
    type CommandInteraction,
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import { Duration } from 'luxon';
import { getContentDetails, RagnarokComponent } from '../../utils/Util.js';

@Discord()
@Category('Fun')
export class TraktCommand {
    /**
     * Fetches IMDb information for specified content.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param content - Optional type of content
     */
    @Slash({ description: 'Fetches IMDb information for specified content.' })
    async imdb(
        @SlashOption({
            description: 'Content to fetch',
            name: 'content',
            required: true,
            type: ApplicationCommandOptionType.String,
        })
        content: string,
        interaction: CommandInteraction
    ): Promise<void> {
        const imdbRegexPattern = /https?:\/\/(www\.|m\.)?imdb\.com\/title\/tt(\d+)(\/)?/;

        const isIMDbURLValid = content.match(imdbRegexPattern);

        const typeOfRequest = isIMDbURLValid ? 'url' : 'name';

        await interaction.deferReply();

        // Data is valid, fetch details
        const details = await getContentDetails(content, typeOfRequest);

        if (!details) {
            await RagnarokComponent(
                interaction,
                'Error',
                'I was unable to find the content you were looking for. Please try again.',
                true
            );
            return;
        }

        // Convert runtime and end time to readable format
        const runTime = Duration.fromObject({ seconds: details.runtime.seconds }).toFormat(
            "h'h' m'm'"
        );

        const header = new TextDisplayBuilder().setContent(
            [
                `# ${details.type === 'Movie' ? '🎬' : '📺'} ${details.title} (${details.year})`,
                `> ${details.plot}`,
            ].join('\n')
        );

        const stats = new TextDisplayBuilder().setContent(
            [
                '## 📊 Stats',
                '',
                `> 🎭 Genres: \`${details.genres || 'N/A'}\``,
                `> 🎬 Director: \`${details.director || 'N/A'}\``,
                `> 🌟 Stars: \`${details.cast || 'N/A'}\``,
                `> 🏢 Production: \`${details.productionCompany || 'N/A'}\``,
                `> ⏱️ Runtime: \`${runTime}\``,
                `> <:imdb:1202979511755612173> Rating: \`${details.rating}/10 (${details.totalVotes.toLocaleString('en')} votes)\``,
            ].join('\n')
        );

        const imageSection = new MediaGalleryBuilder().addItems(
            new MediaGalleryItemBuilder().setURL(details.image)
        );

        const buttonRow = [
            new ButtonBuilder()
                .setLabel(`Open ${details.type}`)
                .setStyle(ButtonStyle.Link)
                .setURL(details.url),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('View Reviews')
                .setURL(`https://imdb.com/title/${details.id}/ratings`),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('View Cast')
                .setURL(`https://imdb.com/title/${details.id}/fullcredits`),
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel('Trivia')
                .setURL(`https://imdb.com/title/${details.id}/trivia`),
        ];

        const container = new ContainerBuilder()
            .addTextDisplayComponents(header)
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
            .addActionRowComponents((row) => row.addComponents(...buttonRow))
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(stats)
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
            .addMediaGalleryComponents(imageSection);

        await interaction.editReply({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}
