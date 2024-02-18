import {
    ButtonComponent, Client, Discord, Slash,
} from 'discordx';
import {
    ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CommandInteraction, EmbedBuilder,
} from 'discord.js';
import { Category } from '@discordx/utilities';
import RedditImageFetcher from 'reddit-image-fetcher';
import { color } from '../../utils/Util.js';

const subreddits = ['memes', 'bonehurtingjuice', 'surrealmemes', 'dankmemes', 'meirl', 'me_irl', 'funny'];

async function getMeme() {
    return RedditImageFetcher.fetch({
        type: 'custom',
        total: 1,
        subreddit: subreddits,
    });
}

async function getNewMeme() {
    return RedditImageFetcher.fetch({
        type: 'custom',
        total: 25,
        subreddit: subreddits,
    });
}

@Discord()
@Category('Fun')
export class Meme {
    /**
     * Fetches a random meme from several subreddits
     * @param interaction - The command interaction.
     */
    @Slash({ description: 'Fetches a random meme from several subreddits' })
    async meme(interaction: CommandInteraction): Promise<void> {
        const meme = await getMeme();

        const embed = new EmbedBuilder()
            .setColor(color(interaction.guild!.members.me!.displayHexColor))
            .setAuthor({
                name: `${meme[0].title.length >= 256 ? `${meme[0].title.substring(0, 253)}...` : meme[0].title}`,
                url: `${meme[0].postLink}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setImage(meme[0].image)
            .setFooter({ text: `👍 ${meme[0].upvotes}` });

        // Buttons to be applied to the embed
        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder()
                .setLabel('Next Meme')
                .setStyle(ButtonStyle.Primary)
                .setCustomId(`nextMeme_${interaction.user.id}`),
        );

        await interaction.reply({ components: [row], embeds: [embed] });
    }

    /**
     * Fetch the next meme
     * @param interaction - The command interaction.
     * @param client - The Discord client.
     */
    @ButtonComponent({ id: /^nextMeme_(\d+)$/ })
    async buttonInteraction(interaction: ButtonInteraction, client: Client) {
        const button = interaction.customId.split('_');

        if (interaction.user.id !== button[1]) {
            const wrongUser = new EmbedBuilder()
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .addFields({ name: `**${client.user?.username} - Meme**`, value: '**◎ Error:** Only the command executor can load the next meme.' });
            await interaction.reply({ ephemeral: true, embeds: [wrongUser] });
            return;
        }

        await interaction.deferReply();
        await interaction.deleteReply();

        const newMemes = await getNewMeme();

        // Pick a random meme
        const randomMeme = newMemes[Math.floor(Math.random() * newMemes.length)];

        // Remove the used meme from the list
        newMemes.splice(newMemes.indexOf(randomMeme), 1);

        // If there are no more memes, remove the button
        if (newMemes.length === 0) {
            const newMeme = new EmbedBuilder()
                .setColor(color(interaction.guild!.members.me!.displayHexColor))
                .setAuthor({
                    name: `${randomMeme.title.length >= 256 ? `${randomMeme.title.substring(0, 253)}...` : randomMeme.title}`,
                    url: `${randomMeme.postLink}`,
                    iconURL: interaction.user.displayAvatarURL(),
                })
                .setImage(randomMeme.image)
                .setFooter({ text: `👍 ${randomMeme.upvotes}` });
            await interaction.message.edit({ embeds: [newMeme], components: [] });
            return;
        }

        const newMeme = new EmbedBuilder()
            .setColor(color(interaction.guild!.members.me!.displayHexColor))
            .setAuthor({
                name: `${randomMeme.title.length >= 256 ? `${randomMeme.title.substring(0, 253)}...` : randomMeme.title}`,
                url: `${randomMeme.postLink}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setImage(randomMeme.image)
            .setFooter({ text: `👍 ${randomMeme.upvotes}` });
        await interaction.message?.edit({ embeds: [newMeme] });
    }
}
