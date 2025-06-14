import {
    ActionRowBuilder,
    ActivityType,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChannelType,
    type ColorResolvable,
    type CommandInteraction,
    EmbedBuilder,
    type GuildMember,
    type Message,
    MessageFlags,
    type ModalSubmitInteraction,
    PermissionsBitField,
    type StringSelectMenuInteraction,
    type TextChannel,
    codeBlock,
} from 'discord.js';
import type { Client } from 'discordx';
import '@colors/colors';
import mongoose from 'mongoose';
import { type ITitle, TitleMainType, getTitleDetailsByName, getTitleDetailsByUrl } from 'movier';
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
 * Fetches all registered global application command IDs.
 * @param client - The Discord client instance.
 * @returns A Promise that resolves to a record of command names to their corresponding IDs.
 * @throws Error if unable to fetch commands or if the client's application is not available.
 */
export async function getCommandIds(client: Client): Promise<Record<string, string>> {
    if (!client.application) {
        throw new Error('Client application is not available');
    }

    try {
        const commands = await client.application.commands.fetch();
        return Object.fromEntries(commands.map((c) => [c.name, c.id]));
    } catch (error) {
        console.error('Error fetching global commands:', error);
        throw error;
    }
}

/**
 * Connects to the MongoDB database and sets up event listeners for the connection.
 * @returns A promise that resolves with void when the connection is established.
 */
export async function loadMongoEvents(): Promise<void> {
    try {
        await mongoose.connect(`${process.env.MONOG_URI}`);
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
            return undefined; // Return early if data is not available
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
 * Creates and sends an embed in response to an interaction.
 * @param client - The Discord client.
 * @param interaction - The interaction that triggered the function.
 * @param type - The type of the interaction.
 * @param content - The content of the embed.
 * @param ephemeral - Whether the interaction response should be ephemeral.
 * @returns - A promise that resolves when the interaction is replied to.
 */
export async function RagnarokEmbed(
    client: Client,
    interaction:
        | CommandInteraction
        | ButtonInteraction
        | StringSelectMenuInteraction
        | ModalSubmitInteraction,
    type: string,
    content: string,
    ephemeral = false
) {
    let commandName = '';

    if (interaction.isStringSelectMenu() || interaction.isButton()) {
        commandName = interaction.message.interaction?.commandName || '';
    } else if (interaction.isCommand()) {
        commandName = interaction.command?.name || '';
    }

    const embed = new EmbedBuilder()
        .setColor(color(interaction.guild!.members.me!.displayHexColor))
        .addFields({
            name: `**${client.user!.username}${commandName ? ` - ${capitalise(commandName)}` : ''}**`,
            value: `**◎ ${type}:** ${content}`,
        });

    try {
        interaction.deferred
            ? await interaction.editReply({ embeds: [embed] })
            : await interaction.reply({
                  embeds: [embed],
                  flags: ephemeral ? [MessageFlags.Ephemeral] : undefined,
              });
    } catch (error) {
        console.error('Error sending embed:', error);
    }
}

export async function pagination(
    interaction: ButtonInteraction | CommandInteraction,
    embeds: EmbedBuilder[],
    externalHome?: ButtonBuilder,
    emojiNext = '▶️',
    emojiHome = '🏠',
    emojiBack = '◀️'
) {
    const back = new ButtonBuilder()
        .setCustomId('back')
        .setEmoji(emojiBack || '◀️')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);

    const home = new ButtonBuilder()
        .setCustomId('home')
        .setEmoji(emojiHome || '🏠')
        .setStyle(ButtonStyle.Primary)
        .setDisabled(true);

    const next = new ButtonBuilder()
        .setCustomId('next')
        .setEmoji(emojiNext || '▶️')
        .setStyle(ButtonStyle.Primary);

    // Create components array conditionally based on whether externalHome exists
    const components = externalHome ? [externalHome, back, home, next] : [back, home, next];

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(...components);

    // Ensure embeds[0] exists before using it
    if (!embeds[0]) {
        return;
    }

    // Handle initial response based on interaction type
    let message: Message;
    if (interaction instanceof ButtonInteraction) {
        // ButtonInteraction
        await interaction.message.edit({
            embeds: [embeds[0].toJSON()],
            components: [row],
            files: [],
        });
        message = interaction.message;
    } else {
        // CommandInteraction
        const response = await interaction.reply({
            embeds: [embeds[0].toJSON()],
            components: [row],
            withResponse: true,
        });
        if (!response.resource?.message) {
            throw new Error('Failed to get message from interaction response');
        }
        message = response.resource.message;
    }

    const collector = message.createMessageComponentCollector({
        time: 30000,
    });

    let currentPage = 0;

    collector.on('collect', async (b) => {
        if (!b.message) {
            return;
        }
        collector.resetTimer();

        if (b.customId === 'back' && currentPage !== 0) {
            currentPage -= 1;
            next.setDisabled(false);
            if (currentPage === 0) {
                back.setDisabled(true);
                home.setDisabled(true);
            }
        }

        if (b.customId === 'next' && currentPage < embeds.length - 1) {
            currentPage += 1;
            back.setDisabled(false);
            home.setDisabled(false);
            if (currentPage === embeds.length - 1) {
                next.setDisabled(true);
            }
        }

        if (b.customId === 'home') {
            currentPage = 0;
            back.setDisabled(true);
            home.setDisabled(true);
            next.setDisabled(false);
        }

        // Don't do anything if the home button for the economy module is pressed
        if (b.customId === 'economy_home') {
            // Stop the collector since we're navigating away from pagination
            collector.stop();
            return;
        }

        // Ensure embeds[currentPage] exists before using it
        const currentEmbed = embeds[currentPage];
        if (!currentEmbed) {
            return;
        }
        await b.update({
            embeds: [currentEmbed.toJSON()],
            components: [row],
            files: [],
        });
    });

    collector.on('end', () => {
        if (!message) {
            return;
        }
        home.setDisabled(true);
        back.setDisabled(true);
        next.setDisabled(true);
        // Ensure embeds[currentPage] exists before using it
        const currentEmbed = embeds[currentPage];
        if (!currentEmbed) {
            return;
        }
        message
            .edit({
                embeds: [currentEmbed.toJSON()],
                components: [row],
                files: [],
            })
            .catch(console.error);
    });

    collector.on('error', console.error);
}

export async function updateLevel(interaction: Message | CommandInteraction) {
    if (
        !interaction.guild ||
        !interaction.channel ||
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
                    .then((m) => deletableCheck(m, 10000));
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
