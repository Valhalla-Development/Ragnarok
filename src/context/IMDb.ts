import {
    ActionRowBuilder,
    ApplicationCommandType,
    ButtonBuilder,
    ButtonStyle,
    codeBlock,
    EmbedBuilder,
    type MessageContextMenuCommandInteraction,
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

        // Data is valid, fetch details
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

        // Convert runtime and end time to readable format
        const runTime = Duration.fromObject({ seconds: details!.runtime.seconds }).toFormat(
            "h'h' m'm'"
        );

        const embed = new EmbedBuilder()
            .setColor('#e0b10e')
            .setAuthor({
                name: `${details.title} (${details.year}) - ${details.type}`,
                url: details.url,
                iconURL:
                    'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/171_Imdb_logo_logos-1024.png',
            })
            .addFields(
                {
                    name: 'Votes',
                    value: `<:imdb:1202979511755612173>** ${details.rating}/10** *(${details.totalVotes.toLocaleString('en')} votes)*`,
                    inline: true,
                },
                { name: 'Genres', value: details.genres || 'N/A', inline: true },
                { name: 'Stars', value: details.cast || 'N/A', inline: true },
                { name: 'Director', value: details.director || 'N/A', inline: true },
                {
                    name: 'Production Company',
                    value: details.productionCompany || 'N/A',
                    inline: true,
                },
                { name: 'Runtime', value: `\`${runTime}\``, inline: true }
            )
            .setDescription(`${codeBlock('text', `${details.plot}`)}`)
            .setImage(details.image);

        // Buttons to be applied to the embed
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
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
                .setURL(`https://imdb.com/title/${details.id}/trivia`)
        );

        // Send the embed
        await interaction.reply({ embeds: [embed], components: [row] });
    }
}
