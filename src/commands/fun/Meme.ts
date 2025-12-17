import { Category } from '@discordx/utilities';
import {
    AttachmentBuilder,
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    type CommandInteraction,
    ContainerBuilder,
    MediaGalleryBuilder,
    MediaGalleryItemBuilder,
    MessageFlags,
    SeparatorSpacingSize,
    TextDisplayBuilder,
} from 'discord.js';
import { ButtonComponent, type Client, Discord, Slash } from 'discordx';
import RedditImageFetcher from 'reddit-image-fetcher';
import { RagnarokEmbed } from '../../utils/Util.js';

const subreddits = [
    'memes',
    'bonehurtingjuice',
    'surrealmemes',
    'dankmemes',
    'meirl',
    'me_irl',
    'funny',
];

async function getMeme() {
    return await RedditImageFetcher.fetch({
        type: 'custom',
        total: 1,
        subreddit: subreddits,
    });
}

async function getNewMeme() {
    return await RedditImageFetcher.fetch({
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

        const title =
            meme[0].title.length >= 256 ? `${meme[0].title.substring(0, 253)}...` : meme[0].title;

        const header = new TextDisplayBuilder().setContent(
            [
                '# 😂 Random Meme',
                `> **[${title}](${meme[0].postLink})**`,
                `> 👍 **Upvotes:** \`${meme[0].upvotes}\``,
            ].join('\n')
        );

        const nextButton = new ButtonBuilder()
            .setLabel('Next Meme')
            .setStyle(ButtonStyle.Primary)
            .setCustomId(`nextMeme_${interaction.user.id}`);

        const container = new ContainerBuilder()
            .addTextDisplayComponents(header)
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Small))
            .addActionRowComponents((row) => row.addComponents(nextButton));

        const response = await fetch(meme[0].image);
        const buffer = Buffer.from(await response.arrayBuffer());
        const attachment = new AttachmentBuilder(buffer, { name: 'meme.png' });

        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder().setURL('attachment://meme.png')
            )
        );

        await interaction.reply({
            components: [container],
            files: [attachment],
            flags: MessageFlags.IsComponentsV2,
        });
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
            await RagnarokEmbed(
                client,
                interaction,
                'Error',
                'Only the command executor can load the next meme.',
                true
            );
            return;
        }

        await interaction.deferReply();
        await interaction.deleteReply();

        const newMemes = await getNewMeme();

        // Pick a random meme
        const randomMeme = newMemes[Math.floor(Math.random() * newMemes.length)];

        // Remove the used meme from the list
        newMemes.splice(newMemes.indexOf(randomMeme), 1);

        const title =
            randomMeme.title.length >= 256
                ? `${randomMeme.title.substring(0, 253)}...`
                : randomMeme.title;

        const header = new TextDisplayBuilder().setContent(
            [
                '# 😂 Random Meme',
                `> **[${title}](${randomMeme.postLink})**`,
                `> 👍 **Upvotes:** \`${randomMeme.upvotes}\``,
            ].join('\n')
        );

        const container = new ContainerBuilder().addTextDisplayComponents(header);

        // If there are no more memes, remove the button
        if (newMemes.length > 0) {
            const nextButton = new ButtonBuilder()
                .setLabel('Next Meme')
                .setStyle(ButtonStyle.Primary)
                .setCustomId(`nextMeme_${interaction.user.id}`);

            container
                .addSeparatorComponents((separator) =>
                    separator.setSpacing(SeparatorSpacingSize.Small)
                )
                .addActionRowComponents((row) => row.addComponents(nextButton));
        }

        const response = await fetch(randomMeme.image);
        const buffer = Buffer.from(await response.arrayBuffer());
        const attachment = new AttachmentBuilder(buffer, { name: 'meme.png' });
        container.addMediaGalleryComponents(
            new MediaGalleryBuilder().addItems(
                new MediaGalleryItemBuilder().setURL('attachment://meme.png')
            )
        );

        await interaction.message?.edit({
            components: [container],
            files: [attachment],
            flags: MessageFlags.IsComponentsV2,
        });
    }
}
