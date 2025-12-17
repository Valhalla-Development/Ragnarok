import {
    ActionRowBuilder,
    ActivityType,
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    ChannelType,
    type ColorResolvable,
    type CommandInteraction,
    ContainerBuilder,
    codeBlock,
    EmbedBuilder,
    type GuildMember,
    type Interaction,
    type Message,
    MessageFlags,
    type ModalSubmitInteraction,
    PermissionsBitField,
    SeparatorSpacingSize,
    type StringSelectMenuInteraction,
    type TextChannel,
    TextDisplayBuilder,
    type UserSelectMenuInteraction,
} from 'discord.js';
import type { Client } from 'discordx';
import '@colors/colors';
import {
    getTitleDetailsByName,
    getTitleDetailsByUrl,
    type ITitle,
    TitleMainType,
} from '@valhalladev/movier';
import mongoose from 'mongoose';
import Level from '../mongo/Level.js';
import LevelConfig from '../mongo/LevelConfig.js';

const xpCooldown = new Set();
const xpCooldownSeconds = 60;

/**
 * Capitalises the first letter of each word in a string.
 * @param str - The string to be capitalised.
 * @returns The capitalised string.
 */
export const capitalise = (str: string): string => str.replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Returns a modified color value based on the input.
 * If the input color value is black (#000000), it is replaced with a red shade (#A10000).
 * Otherwise, the input value is returned unchanged.
 * @param me - The color value to modify, should be of type string
 * @returns The modified color value as a `ColorResolvable`
 */
export function color(me: string): ColorResolvable {
    if (me === '#000000') {
        return '#A10000' as ColorResolvable;
    }
    return me as ColorResolvable;
}

/**
 * Deletes a message after a specified amount of time if the bot has the `Manage Messages` permission.
 * @param message The message to delete.
 * @param time The amount of time in milliseconds to wait before deleting the message.
 * @returns A Promise that resolves when the message is deleted, or rejects if the message could not be deleted.
 * @throws TypeError if the `message` parameter is not a valid Message object.
 */
export async function messageDelete(message: Message, time: number): Promise<void> {
    try {
        // Check if the bot has the Manage Messages permission
        const botMember = message.guild?.members.cache.get(message.client.user.id);
        if (botMember?.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            // Create a Promise object that resolves after the specified amount of time
            const promise = new Promise<void>((resolve) => {
                setTimeout(() => {
                    resolve();
                }, time);
            });

            // Wait for the Promise to resolve before continuing
            await promise;

            // Check if the message is deletable before attempting to delete it
            if (message.deletable) {
                await message.delete();
            }
        }
    } catch (error) {
        // Handle any errors that occur during message deletion
        console.error('Error: Failed to delete the message:', error);
        throw error;
    }
}

/**
 * Deletes a message after a specified delay if it's deletable.
 * @param message - The message to delete.
 * @param time - The delay before deletion, in milliseconds.
 */
export function deletableCheck(message: Message, time: number): void {
    setTimeout(() => {
        message.delete().catch((error) => console.error('Error deleting message:', error));
    }, time);
}

/**
 * Fetches command IDs for both global and guild commands.
 * @param client - The Discord client instance
 * @returns Promise resolving to a record of command names to their IDs
 */
export async function getCommandIds(
    client: Client,
    guildId: string
): Promise<Record<string, string>> {
    if (!client.application) {
        throw new Error('Client application is not available');
    }

    const commandIds = new Map<string, string>();
    const isGuildOnly = client.botGuilds && client.botGuilds.length > 0;

    // Fetch global commands
    if (!isGuildOnly) {
        try {
            const globalCommands = await client.application.commands.fetch();
            for (const cmd of globalCommands.values()) {
                commandIds.set(cmd.name, cmd.id);
            }
        } catch (error) {
            console.warn('Could not fetch global commands:', error);
        }
    }

    // Fetch guild commands
    const guild = client.guilds.cache.get(guildId);
    if (guild) {
        try {
            const guildCommands = await guild.commands.fetch();
            for (const cmd of guildCommands.values()) {
                commandIds.set(cmd.name, cmd.id);
            }
        } catch (error) {
            console.warn(`Could not fetch commands for guild ${guild.name}:`, error);
        }
    }

    return Object.fromEntries(commandIds);
}

/**
 * Connects to the MongoDB database and sets up event listeners for the connection.
 * @returns A promise that resolves with void when the connection is established.
 */
export async function loadMongoEvents(): Promise<void> {
    try {
        await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log('[Database Status]: Connected.'.green.bold);
    } catch (err) {
        console.error(
            '[Database Status]: An error occurred with the Mongo connection:'.red.bold,
            `\n${err}`
        );
        throw err;
    }

    mongoose.connection.on('connecting', () => {
        console.log('[Database Status]: Connecting.'.cyan.bold);
    });

    mongoose.connection.on('connected', () => {
        console.log('[Database Status]: Connected.'.green.bold);
    });

    mongoose.connection.on('error', (err) => {
        console.error(
            '[Database Status]: An error occurred with the Mongo connection:'.red.bold,
            `\n${err}`
        );
    });

    mongoose.connection.on('disconnected', () => {
        console.log('[Database Status]: Disconnected'.red.bold);
    });
}

/**
 * Fetches and returns details of content based on the provided URL.
 * @param url - The URL of the content.
 * @param type - Type of request, either search by name, or by url
 * @returns A promise that resolves to content details or undefined if the data is not available.
 */
export async function getContentDetails(url: string, type: 'name' | 'url') {
    try {
        let data: ITitle | undefined;

        // Attempt to fetch the content data
        if (type === 'url') {
            data = await getTitleDetailsByUrl(url);
        }

        if (type === 'name') {
            data = await getTitleDetailsByName(url);
        }

        if (!data) {
            console.error('Content is not available.');
            return; // Return early if data is not available
        }

        const contentType = {
            [TitleMainType.Movie]: 'Movie',
            [TitleMainType.Series]: 'Series',
            [TitleMainType.SeriesEpisode]: 'Series Episode',
            [TitleMainType.TVSpecial]: 'TV Special',
            [TitleMainType.TVShort]: 'TV Short',
            [TitleMainType.TVMovie]: 'TV Movie',
            [TitleMainType.Video]: 'Video',
        };

        // https://paste.valhalladev.org/eyeromubih.yaml | https://www.imdb.com/title/tt8772262/

        // Extract relevant details from the data
        return {
            title: data.name,
            year: data.titleYear,
            plot: data.plot,
            type: contentType[data.mainType],
            rating: data.mainRate.rate,
            totalVotes: data.mainRate.votesCount,
            cast: data.casts
                .slice(0, 3)
                .map((cast) => cast.name)
                .join(', '),
            genres: capitalise(data.genres.join(', ')),
            image: data.posterImage.url,
            url: data.mainSource.sourceUrl,
            id: data.mainSource.sourceId,
            productionCompany: data.productionCompanies[0]?.name,
            runtime: data.runtime,
            director: data.directors[0]?.name,
        };
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

/**
 * Creates and sends a components-based message (Components V2) in response to an interaction.
 * @param interaction - The interaction that triggered the function.
 * @param type - The type of the interaction.
 * @param content - The content of the message.
 * @param ephemeral - Whether the interaction response should be ephemeral.
 * @returns - A promise that resolves when the interaction is replied to.
 */
export async function RagnarokComponent(
    interaction:
        | CommandInteraction
        | ButtonInteraction
        | StringSelectMenuInteraction
        | ModalSubmitInteraction
        | UserSelectMenuInteraction,
    type: string,
    content: string,
    ephemeral = false
) {
    const lowerType = type.toLowerCase();
    const typeEmoji =
        lowerType.includes('error') || lowerType.includes('fail')
            ? '⛔'
            : lowerType.includes('warn')
              ? '⚠️'
              : lowerType.includes('success')
                ? '✅'
                : 'ℹ️';

    const tagLine = new TextDisplayBuilder().setContent(`**${typeEmoji} ${type}**`);
    const contentLine = new TextDisplayBuilder().setContent(content);

    const container = new ContainerBuilder()
        .addTextDisplayComponents(tagLine)
        .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(contentLine);

    const flags = ephemeral
        ? MessageFlags.Ephemeral + MessageFlags.IsComponentsV2
        : MessageFlags.IsComponentsV2;

    try {
        if (interaction.deferred) {
            await interaction.editReply({
                components: [container],
                flags,
            });
        } else {
            await interaction.reply({
                components: [container],
                flags,
            });
        }
    } catch (error) {
        console.error('Error sending component response:', error);
    }
}

/**
 * Creates a pagination system for a list of embeds with next, back, and home buttons.
 * @param interaction - The interaction that triggered the pagination.
 * @param embeds - An array of EmbedBuilders to paginate.
 * @param emojiNext - The emoji to use for the next button. Defaults to '▶️'.
 * @param emojiHome - The emoji to use for the home button. Defaults to '🏠'.
 * @param emojiBack - The emoji to use for the back button. Defaults to '◀️'.
 * @returns A promise that resolves with void when the pagination is complete.
 */
export async function pagination(
    interaction: CommandInteraction,
    embeds: EmbedBuilder[],
    emojiNext: string,
    emojiHome: string,
    emojiBack: string
) {
    // Guard: no embeds to paginate
    if (embeds.length === 0) {
        await interaction.reply({ content: 'Nothing to display.', ephemeral: true });
        return;
    }
    const back = new ButtonBuilder()
        .setCustomId('back')
        .setEmoji(emojiBack)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);

    const home = new ButtonBuilder()
        .setCustomId('home')
        .setEmoji(emojiHome)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);

    const next = new ButtonBuilder()
        .setCustomId('next')
        .setEmoji(emojiNext)
        .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(back, home, next);

    const m = await interaction.reply({
        embeds: [embeds[0]!],
        components: [row],
        fetchReply: true,
    });

    const filter = (i: Interaction) => {
        if (!i.isButton()) {
            return false;
        }
        const button = i as ButtonInteraction;
        return button.user.id === interaction.user.id;
    };

    const collector = m.createMessageComponentCollector({
        filter,
        time: 30_000,
    });

    let currentPage = 0;

    collector.on('collect', async (b) => {
        collector.resetTimer();

        if (b.customId === 'back' && currentPage !== 0) {
            if (currentPage === embeds.length - 1) {
                next.setDisabled(false);
            }

            currentPage -= 1;

            if (currentPage === 0) {
                back.setDisabled(true);
                home.setDisabled(true);
            }

            const rowNew = new ActionRowBuilder<ButtonBuilder>().addComponents(back, home, next);

            await b.update({
                embeds: [embeds[currentPage]!],
                components: [rowNew],
            });
        }

        if (b.customId === 'next' && currentPage < embeds.length - 1) {
            currentPage += 1;

            if (currentPage === embeds.length - 1) {
                next.setDisabled(true);
            }

            home.setDisabled(false);
            back.setDisabled(false);

            const rowNew = new ActionRowBuilder<ButtonBuilder>().addComponents(back, home, next);

            await b.update({
                embeds: [embeds[currentPage]!],
                components: [rowNew],
            });
        }

        if (b.customId === 'home') {
            currentPage = 0;
            home.setDisabled(true);
            back.setDisabled(true);
            next.setDisabled(false);

            const rowNew = new ActionRowBuilder<ButtonBuilder>().addComponents(back, home, next);

            await b.update({ embeds: [embeds[currentPage]!], components: [rowNew] });
        }
    });

    collector.on('end', () => {
        home.setDisabled(true);
        back.setDisabled(true);
        next.setDisabled(true);

        interaction.editReply({ embeds: [embeds[currentPage]!], components: [row] });
    });

    collector.on('error', (e: Error) => console.log(e));
}

export async function updateLevel(interaction: Message | CommandInteraction) {
    if (
        !(interaction.guild && interaction.channel) ||
        interaction.channel.type !== ChannelType.GuildText
    ) {
        return;
    }

    try {
        const member = interaction.member as GuildMember;

        if (!member) {
            return;
        }

        if (xpCooldown.has(member.id)) {
            return;
        }

        const levelDb = await LevelConfig.findOne({ GuildId: interaction.guild.id });

        const xpAdd = Math.floor(Math.random() * 11 + 15);
        const score = await Level.findOneAndUpdate(
            { IdJoined: `${member.id}-${interaction.guild.id}` },
            {
                $inc: { Xp: xpAdd },
                $setOnInsert: { UserId: member.id, GuildId: interaction.guild.id, Level: 0 },
            },
            { upsert: true, new: true }
        ).exec();

        const nxtLvl =
            (5 / 6) *
            (score.Level + 1) *
            (2 * (score.Level + 1) * (score.Level + 1) + 27 * (score.Level + 1) + 91);

        if (nxtLvl <= score.Xp) {
            score.Level += 1;

            await score.save();

            if (
                !levelDb &&
                interaction.channel
                    .permissionsFor(interaction.guild.members.me!)
                    .has(PermissionsBitField.Flags.SendMessages)
            ) {
                interaction.channel
                    .send({
                        content: `${interaction.member} has reached level **${score.Level}**!`,
                        allowedMentions: { parse: [] },
                    })
                    .then((m) => deletableCheck(m, 10_000));
            }
        }

        xpCooldown.add(member.id);
        setTimeout(() => xpCooldown.delete(member.id), xpCooldownSeconds * 1000);
    } catch (error) {
        console.error(error);
    }
}

/**
 * Updates the status of the Discord client with information about guilds and users.
 * @param client - The Discord client instance.
 */
export function updateStatus(client: Client) {
    client.user?.setActivity({
        type: ActivityType.Watching,
        name: `${client.guilds.cache.size.toLocaleString('en')} Guilds
            ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0).toLocaleString('en')} Users`,
    });
}

/**
 * Applies a reversed rainbow effect to the input string.
 * @param str - The string to apply the reversed rainbow effect.
 * @returns The input string with reversed rainbow coloring.
 */
export const reversedRainbow = (str: string): string => {
    const colors = ['red', 'magenta', 'blue', 'green', 'yellow', 'red'] as const;
    return str
        .split('')
        .map((char, i) => char[colors[i % colors.length] as keyof typeof char])
        .join('');
};

/**
 * Handles given error by logging it and optionally sending it to a Discord channel.
 * @param client - The Discord client instance
 * @param error - The unknown error
 */
export async function handleError(client: Client, error: unknown): Promise<void> {
    // Properly log the raw error for debugging
    console.error('Raw error:', error);

    // Create an error object if we received something else
    const normalizedError = error instanceof Error ? error : new Error(String(error));

    // Ensure we have a stack trace
    const errorStack = normalizedError.stack || normalizedError.message || String(error);

    if (
        process.env.ENABLE_LOGGING?.toLowerCase() !== 'true' ||
        !process.env.ERROR_LOGGING_CHANNEL
    ) {
        return;
    }

    /**
     * Truncates the description if it exceeds the maximum length.
     * @param description - The description to truncate
     * @returns The truncated description
     */
    function truncateDescription(description: string): string {
        const maxLength = 4096;
        if (description.length <= maxLength) {
            return description;
        }
        const numTruncatedChars = description.length - maxLength;
        return `${description.slice(0, maxLength)}... ${numTruncatedChars} more`;
    }

    try {
        const channel = client.channels.cache.get(process.env.ERROR_LOGGING_CHANNEL) as
            | TextChannel
            | undefined;

        if (!channel || channel.type !== ChannelType.GuildText) {
            console.error(`Invalid logging channel: ${process.env.ERROR_LOGGING_CHANNEL}`);
            return;
        }

        const typeOfError = normalizedError.name || 'Unknown Error';
        const timeOfError = `<t:${Math.floor(Date.now() / 1000)}>`;

        const fullString = [
            `From: \`${typeOfError}\``,
            `Time: ${timeOfError}`,
            '',
            'Error:',
            codeBlock('js', errorStack),
        ].join('\n');

        const embed = new EmbedBuilder()
            .setTitle('Error')
            .setDescription(truncateDescription(fullString))
            .setColor('#FF0000');

        await channel.send({ embeds: [embed] });
    } catch (sendError) {
        console.error('Failed to send the error embed:', sendError);
    }
}
