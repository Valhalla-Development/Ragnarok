import {
    ActivityType,
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    ChannelType,
    type ColorResolvable,
    type CommandInteraction,
    ContainerBuilder,
    codeBlock,
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
import axios from 'axios';
import mongoose from 'mongoose';
import { config } from '../config/Config.js';
import Balance from '../mongo/Balance.js';
import Level from '../mongo/Level.js';
import LevelConfig from '../mongo/LevelConfig.js';
import { ecoPrices } from './economy/Config.js';

const xpCooldown = new Set();
const xpCooldownSeconds = 60;

function getPerMessagePayout(): number {
    const min = Math.min(ecoPrices.messaging.minPerMessage, ecoPrices.messaging.maxPerMessage);
    const max = Math.max(ecoPrices.messaging.minPerMessage, ecoPrices.messaging.maxPerMessage);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function awardPerMessagePayout(interaction: Message, memberId: string): Promise<void> {
    const guildId = interaction.guild?.id;
    if (!guildId) {
        return;
    }

    const payout = getPerMessagePayout();
    if (payout <= 0) {
        return;
    }

    const idJoined = `${memberId}-${guildId}`;
    await Balance.findOneAndUpdate(
        { IdJoined: idJoined },
        {
            $setOnInsert: {
                IdJoined: idJoined,
                UserId: memberId,
                GuildId: guildId,
                Cash: 0,
                Bank: 500,
                Total: 500,
                ClaimNewUser: Date.now() + ecoPrices.claims.newUserTime,
            },
            $inc: { Cash: payout, Total: payout },
        },
        {
            upsert: true,
            returnDocument: 'after',
            setDefaultsOnInsert: true,
        }
    ).exec();
}

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
                await message.delete().catch((error: unknown) => {
                    // Ignore races where the message was already deleted (DiscordAPIError 10008)
                    const err = error as { code?: number; message?: string };
                    if (err?.code === 10_008 || err?.message?.includes('Unknown Message')) {
                        return;
                    }
                    throw error;
                });
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
            trailers: data.trailers ?? [],
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
 * Builds a simple Components V2 container with a title and body text.
 * @param title - Heading shown at the top of the container.
 * @param body - Markdown body content.
 */
export function RagnarokContainer(title: string, body: string): ContainerBuilder {
    const header = new TextDisplayBuilder().setContent(`# ${title}`);
    const content = new TextDisplayBuilder().setContent(body);

    return new ContainerBuilder()
        .addTextDisplayComponents(header)
        .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
        .addTextDisplayComponents(content);
}

/**
 * Components V2 pagination helper (no custom :nav: handlers required).
 *
 * - Works for both Slash commands (replies) and Button interactions (edits the existing message)
 * - Pages are generated on-demand via `getPage(pageIndex)`
 * - Navigation lives in a normal ActionRow alongside the V2 container
 */
export async function paginationComponentsV2(
    interaction: CommandInteraction | ButtonInteraction,
    getPage: (pageIndex: number) => Promise<ContainerBuilder>,
    totalPages: number,
    options?: {
        initialPage?: number;
        timeoutMs?: number;
        emojis?: { prev?: string; home?: string; next?: string };
    }
): Promise<void> {
    const timeoutMs = options?.timeoutMs ?? 30_000;
    const emojis = {
        prev: options?.emojis?.prev ?? '◀️',
        home: options?.emojis?.home ?? '🏠',
        next: options?.emojis?.next ?? '▶️',
    };

    const safeTotalPages = Math.max(1, totalPages);
    const clamp = (n: number) => Math.min(Math.max(0, n), Math.max(0, safeTotalPages - 1));
    let currentPage = clamp(options?.initialPage ?? 0);

    // Unique-ish ids so multiple paginators don't collide
    const prefix = `pg:${Date.now().toString(36)}:${Math.random().toString(36).slice(2, 8)}`;
    const idPrev = `${prefix}:prev`;
    const idHome = `${prefix}:home`;
    const idNext = `${prefix}:next`;

    const prev = new ButtonBuilder()
        .setCustomId(idPrev)
        .setEmoji(emojis.prev)
        .setStyle(ButtonStyle.Secondary);

    const home = new ButtonBuilder()
        .setCustomId(idHome)
        .setEmoji(emojis.home)
        .setStyle(ButtonStyle.Primary);

    const next = new ButtonBuilder()
        .setCustomId(idNext)
        .setEmoji(emojis.next)
        .setStyle(ButtonStyle.Secondary);

    const applyNavState = () => {
        prev.setDisabled(currentPage === 0);
        home.setDisabled(currentPage === 0);
        next.setDisabled(currentPage >= safeTotalPages - 1);
    };

    const render = async () => {
        const page = await getPage(currentPage);
        // Only show pagination controls if there is more than 1 page
        if (safeTotalPages > 1) {
            applyNavState();
            page.addSeparatorComponents((separator) =>
                separator.setSpacing(SeparatorSpacingSize.Small)
            );
            // Put nav buttons "inside" the V2 container (not as a separate top-level row)
            page.addActionRowComponents((row) => row.addComponents(prev, home, next));
        }
        return { components: [page], flags: MessageFlags.IsComponentsV2 as number };
    };

    // Initial render + acquire message to collect from
    let message: Message;
    if (interaction.isButton()) {
        const payload = await render();
        // Button interactions must be acknowledged. Prefer updating the original message;
        // fall back to editing if this interaction was already acknowledged elsewhere.
        if (interaction.deferred || interaction.replied) {
            await interaction.message.edit(payload);
        } else {
            await interaction.update(payload);
        }
        message = interaction.message;
    } else {
        const payload = await render();
        const resp = await interaction.reply({ ...payload, withResponse: true });
        const msg = resp.resource?.message;
        if (!msg) {
            return;
        }
        message = msg;
    }

    // No need to collect button presses when there's only one page
    if (safeTotalPages <= 1) {
        return;
    }

    const filter = (i: Interaction) =>
        i.isButton() &&
        [idPrev, idHome, idNext].includes(i.customId) &&
        i.user.id === interaction.user.id;

    const collector = message.createMessageComponentCollector({
        filter,
        time: timeoutMs,
    });

    collector.on('collect', async (b) => {
        collector.resetTimer();

        if (b.customId === idPrev) {
            currentPage = clamp(currentPage - 1);
        } else if (b.customId === idNext) {
            currentPage = clamp(currentPage + 1);
        } else if (b.customId === idHome) {
            currentPage = 0;
        }

        const payload = await render();
        await b.update(payload);
    });

    collector.on('end', async () => {
        prev.setDisabled(true);
        home.setDisabled(true);
        next.setDisabled(true);

        const payload = await render();
        await message.edit(payload);
    });
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
            { upsert: true, returnDocument: 'after' }
        ).exec();

        const currentLevel = Number(score.Level ?? 0);
        const currentXp = Number(score.Xp ?? 0);
        const nxtLvl =
            (5 / 6) *
            (currentLevel + 1) *
            (2 * (currentLevel + 1) * (currentLevel + 1) + 27 * (currentLevel + 1) + 91);

        if (nxtLvl <= currentXp) {
            score.Level = currentLevel + 1;

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

        if ('author' in interaction) {
            await awardPerMessagePayout(interaction as Message, member.id);
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

        const container = RagnarokContainer('Error', truncateDescription(fullString));
        await channel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { parse: [] },
        });
    } catch (sendError) {
        console.error('Failed to send the error component message:', sendError);
    }
}

/**
 * Scrambles the input word using the Fisher-Yates shuffle algorithm.
 * @param word - The input word to be scrambled.
 * @returns The scrambled word as a string.
 */
export function scrambleWord(word: string): string {
    const wordArray = word.split('');
    let currentIndex = wordArray.length;
    let temporaryValue: string;
    let randomIndex: number;

    // Fisher-Yates shuffle algorithm
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = wordArray[currentIndex]!;
        wordArray[currentIndex] = wordArray[randomIndex]!;
        wordArray[randomIndex] = temporaryValue;
    }

    return wordArray.join('');
}

/**
 * Fetches a random word based on the input difficulty level, scrambles it, and retrieves its pronunciation, part of speech,
 * definition, and an example sentence from the Wordnik API.
 *
 * @param difficulty - The difficulty level of the word to be fetched: 'easy', 'medium', or 'hard'.
 * @returns A Promise that resolves to an object containing the original word, scrambled word, pronunciation, part of speech,
 * and an array of fields containing the definition and example sentence.
 */
export async function fetchAndScrambleWord(): Promise<{
    originalWord: string;
    scrambledWord: string;
    pronunciation: string;
    partOfSpeech: string;
    definition: string[];
    fieldArray: { name: string; value: string }[];
}> {
    const url = `${config.VALHALLA_API_URI}/wordEnhanced`;

    try {
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${config.VALHALLA_API_KEY}` },
        });

        const { data } = response;

        const { word } = data;
        const scrambledWord = scrambleWord(word);
        const { partOfSpeech } = data;
        const { definition } = data;
        const { pronunciation } = data;

        const fieldArray: { name: string; value: string }[] = [];
        fieldArray.push({ name: '**Definition:**', value: `>>> *${definition.join('\n')}*` });

        return {
            originalWord: word,
            scrambledWord,
            pronunciation,
            partOfSpeech,
            definition,
            fieldArray,
        };
    } catch (error) {
        console.error('Error fetching and scrambling word:', error);
        throw error;
    }
}

/**
 * Fetches a random word from the Valhalla API.
 * @returns A Promise that resolves to a random word if successful or null if an error occurs.
 * @throws Throws an error if the request fails or if there is an unexpected response status.
 * @example
 * const randomWord = await getRandomWord();
 * console.log(randomWord);
 */
export async function getRandomWord(): Promise<string | null> {
    const url = `${config.VALHALLA_API_URI}/word`;

    try {
        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${config.VALHALLA_API_KEY}` },
        });

        if (response.status === 200) {
            const { word } = response.data;
            return word;
        }
        console.log(`Error: ${response.status}`);
        return null;
    } catch (error) {
        console.log(`Error: ${error}`);
        return null;
    }
}
