import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';
import {
    ButtonBuilder, ButtonStyle, ActionRowBuilder, EmbedBuilder, codeBlock,
} from 'discord.js';
import { getTitleDetailsByIMDBId } from 'movier';
import { capitalise } from '../utils/Util.js';

@Discord()
export class MessageCreate {
    /**
     * Handler for messageCreate event.
     * @param args - An array containing the interaction and client objects.
     * @param client - The Discord client.
     */
    @On({ event: 'messageCreate' })
    async onMessage([message]: ArgsOf<'messageCreate'>) {
        // Function to monitor the messageCreate event for IMDb links and fetch content via API calls.
        async function imdbMonitor() {
            // Define a regular expression pattern to match IMDb links.
            const regexPattern = /https?:\/\/(www\.|m\.)?imdb\.com\/title\/tt(\d+)(\/)?/;

            // Match the regex pattern in the message content.
            const match = message.content.toLowerCase().match(regexPattern);

            if (match) {
                const imdbId = `tt${match[2]}`;

                // Map IMDb content types to user-friendly labels.
                const contentTypeLabels: Record<string, string> = {
                    series: 'Series',
                    movie: 'Movie',
                    tvMovie: 'TV Movie',
                };

                try {
                    // Fetch IMDb content details using the IMDb ID.
                    const res = await getTitleDetailsByIMDBId(imdbId);

                    // Create buttons for various actions.
                    const buttonLink = new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setLabel(`Open ${contentTypeLabels[res.mainType] || res.mainType}`)
                        .setURL(match[0]);
                    const buttonReview = new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setLabel('View Reviews')
                        .setURL(`https://imdb.com/title/${imdbId}/ratings`);
                    const buttonCast = new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setLabel('View Cast')
                        .setURL(`https://imdb.com/title/${imdbId}/fullcredits`);
                    const buttonTrivia = new ButtonBuilder()
                        .setStyle(ButtonStyle.Link)
                        .setLabel('Trivia')
                        .setURL(`https://imdb.com/title/${imdbId}/trivia`);

                    // Create an action row containing the buttons.
                    const row = new ActionRowBuilder<ButtonBuilder>()
                        .addComponents(buttonLink, buttonReview, buttonCast, buttonTrivia);

                    // Create an embed to display IMDb content details.
                    const embed = new EmbedBuilder()
                        .setColor('#e0b10e')
                        .setAuthor({
                            name: `${res.name} (${res.dates.titleYear}${res.mainType === 'series' ? ` - ${res.dates.endYear === null ? 'Still Airing' : res.dates.endYear}` : ''}) - ${contentTypeLabels[res.mainType] || res.mainType}`,
                            url: match[0],
                            iconURL: 'https://cdn4.iconfinder.com/data/icons/logos-and-brands/512/171_Imdb_logo_logos-1024.png',
                        })
                        .addFields(
                            { name: 'Votes', value: `**<:imdb:977228158615027803> ${res.mainRate.rate}/10** *(${res.mainRate.votesCount.toLocaleString()} votes)*`, inline: true },
                            { name: 'Genres', value: capitalise(res.genres.join(', ')), inline: true },
                            { name: 'Stars', value: res.casts.slice(0, 3).map((cast) => cast.name).join(', ') },
                        )
                        .setDescription(
                            `${codeBlock('text', `${res.plot}`)} `,
                        )
                        .setImage(res.posterImage.url);

                    // Reply with the embed and action row.
                    await message.reply({ embeds: [embed], components: [row], allowedMentions: { repliedUser: false } });
                } catch (error) {
                    console.error('Error during IMDb fetch:', error);
                }
            }
        }

        // Call the IMDb monitor function.
        await imdbMonitor();
    }
}
