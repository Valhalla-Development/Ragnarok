import {
    ApplicationCommandType,
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    type MessageContextMenuCommandInteraction,
    MessageFlags,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import { ContextMenu, Discord } from 'discordx';
import { Duration } from 'luxon';
import { getContentDetails, RagnarokComponent } from '../utils/Util.js';

@Discord()
export class IMDbContext {
    /**
     * Fetches IMDb information for specified content.
     * @param interaction - The command interaction
     * @param client - The Discord client.
     */
    @ContextMenu({
        name: 'IMDb',
        type: ApplicationCommandType.Message,
    })
    async imdbContext(interaction: MessageContextMenuCommandInteraction): Promise<void> {
        const imdbRegexPattern = /https?:\/\/(www\.|m\.)?imdb\.com\/title\/tt(\d+)(\/)?/;

        const { content } = interaction.targetMessage;

        const isIMDbURLValid = content.match(imdbRegexPattern);

        const typeOfRequest = isIMDbURLValid ? 'url' : 'name';

        await interaction.deferReply();

        const details = await getContentDetails(
            isIMDbURLValid ? isIMDbURLValid[0] : content,
            typeOfRequest
        );

        if (!details) {
            await RagnarokComponent(
                interaction,
                'Error',
                'I was unable to find the content you were looking for. Please try again.',
                true
            );
            return;
        }

        const runTime = Duration.fromObject({ seconds: details!.runtime.seconds }).toFormat(
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
