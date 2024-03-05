import {
    Client, Discord, Slash, SlashOption,
} from 'discordx';
import { ApplicationCommandOptionType, CommandInteraction, EmbedBuilder } from 'discord.js';
import { Category } from '@discordx/utilities';
import axios from 'axios';
import { color, RagnarokEmbed } from '../../utils/Util.js';

@Discord()
@Category('Fun')
export class Reddit {
    /**
     * Search a specified subreddit with a query.
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     * @param subreddit - The subreddit to lookup
     * @param query - The query to search
     */
    @Slash({ description: 'Search a specified subreddit with a query' })
    async reddit(
        @SlashOption({
            description: 'The subreddit to lookup',
            name: 'subreddit',
            type: ApplicationCommandOptionType.String,
            required: true,
        })
            subreddit: string,
        @SlashOption({
            description: 'The query to search',
            name: 'query',
            type: ApplicationCommandOptionType.String,
        })
            query: string,
            interaction: CommandInteraction,
            client: Client,
    ): Promise<void> {
        await interaction.deferReply();

        await axios.get(`https://www.reddit.com/r/${subreddit}/search.json?q=${query.split(' ').join('%20')}&restrict_sr=1&limit=3`)
            .then((response) => {
                const { children } = response.data.data;
                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: `${children[0].data.subreddit} - Top 3 results for: ${query.split(' ').join('%20')}`,
                        url: `https://www.reddit.com/r/${subreddit}/search/?q=${query.split(' ').join('%20')}&restrict_sr=1`,
                        iconURL: 'https://logodownload.org/wp-content/uploads/2018/02/reddit-logo-16.png',
                    })
                    .setColor(color(interaction.guild!.members.me!.displayHexColor))
                    .setDescription(`[**◎ ${children[0].data.title}**](${children[0].data.url})\n
        \`\`\`${children[0].data.selftext.substring(0, 150)}...\`\`\`\n
        [**◎ ${children[1].data.title}**](${children[1].data.url})\n
        \`\`\`${children[1].data.selftext.substring(0, 150)}...\`\`\`\n
        [**◎ ${children[2].data.title}**](${children[2].data.url})\n
        \`\`\`${children[2].data.selftext.substring(0, 150)}...\`\`\`\n
        [**__Search Results...__**](https://www.reddit.com/r/${subreddit}/search/?q=${query.split(' ').join('%20')}&restrict_sr=1)`);
                interaction.editReply({ embeds: [embed] });
            })
            .catch(async () => {
                await RagnarokEmbed(client, interaction, 'Error', `No results found for \`${query}\``);
            });
    }
}
