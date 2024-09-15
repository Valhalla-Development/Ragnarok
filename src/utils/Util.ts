import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChannelType,
    ColorResolvable,
    CommandInteraction,
    EmbedBuilder,
    GuildMember,
    Message,
    ModalSubmitInteraction,
    PermissionsBitField,
    StringSelectMenuInteraction,
} from 'discord.js';
import { Client } from 'discordx';
import '@colors/colors';
import mongoose from 'mongoose';
import { getTitleDetailsByName, getTitleDetailsByUrl, TitleMainType } from 'movier';
import LevelConfig from '../mongo/LevelConfig.js';
import Level from '../mongo/Level.js';

const xpCooldown = new Set();
const xpCooldownSeconds = 60;

/**
 * Capitalises the first letter of each word in a string.
 * @param string - The string to be capitalised.
 * @returns The capitalised string.
 */
export function capitalise(string: string): string {
    return string.replace(/\S+/g, (word) => word.slice(0, 1).toUpperCase() + word.slice(1));
}

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
 * Checks if a message is deletable, and deletes it after a specified amount of time.
 * @param message - The message to check.
 * @param time - The amount of time to wait before deleting the message, in milliseconds.
 * @returns void
 */
export function deletableCheck(message: Message, time: number): void {
    setTimeout(async () => {
        try {
            if (message && message.deletable) {
                await message.delete();
            }
        } catch (error) {
            // Do nothing with the error
        }
    }, time);
}

/**
 * Fetches the registered global application commands and returns an object
 * containing the command names as keys and their corresponding IDs as values.
 * @param client - The Discord Client instance.
 * @returns An object containing command names and their corresponding IDs.
 * If there are no commands or an error occurs, an empty object is returned.
 */
export async function getCommandIds(client: Client): Promise<{ [name: string]: string }> {
    try {
        // Fetch the registered global application commands
        const commands = await client.application?.commands.fetch();

        if (!commands) {
            return {};
        }

        // Create an object to store the command IDs
        const commandIds: { [name: string]: string } = {};

        commands.forEach((command) => {
            commandIds[command.name] = command.id;
        });

        return commandIds;
    } catch (error) {
        console.error('Failed to fetch global commands:', error);
        return {};
    }
}

/**
 * Connects to the MongoDB database and sets up event listeners for the connection.
 * @returns A promise that resolves with void when the connection is established.
 */
export async function loadMongoEvents(): Promise<void> {
    try {
        await mongoose.connect(`${process.env.MongoUri}`);
        console.log('[Database Status]: Connected.'.green.bold);
    } catch (err) {
        console.error('[Database Status]: An error occurred with the Mongo connection:'.red.bold, `\n${err}`);
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
            `\n${err}`,
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
        let data;

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
            cast: data.casts.slice(0, 3).map((cast) => cast.name).join(', '),
            genres: capitalise(data.genres.join(', ')),
            image: data.posterImage.url,
            url: data.mainSource.sourceUrl,
            id: data.mainSource.sourceId,
            productionCompany: data.productionCompanies[0].name,
            runtime: data.runtime,
            director: data.directors[0].name,
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
    interaction: CommandInteraction | ButtonInteraction | StringSelectMenuInteraction | ModalSubmitInteraction,
    type: string,
    content: string,
    ephemeral: boolean = false,
) {
    let commandName: string = '';

    if (interaction.isStringSelectMenu() || interaction.isButton()) {
        commandName = interaction.message.interaction?.commandName || '';
    } else if (interaction.isCommand()) {
        commandName = interaction.command?.name || '';
    }

    const embed = new EmbedBuilder()
        .setColor(color(interaction.guild!.members.me!.displayHexColor))
        .addFields({ name: `**${client.user!.username}${commandName ? ` - ${capitalise(commandName)}` : ''}**`, value: `**◎ ${type}:** ${content}` });

    try {
        interaction.deferred
            ? await interaction.editReply({ embeds: [embed] })
            : await interaction.reply({ ephemeral, embeds: [embed] });
    } catch (error) {
        console.error('Error sending embed:', error);
    }
}

export async function pagination(interaction: ButtonInteraction, embeds: EmbedBuilder[], economyHome: ButtonBuilder, emojiNext = '▶️', emojiHome = '🏠', emojiBack = '◀️') {
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

    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(economyHome, back, home, next);

    await interaction.message.edit({ embeds: [embeds[0]], components: [row] });

    const collector = interaction.message.createMessageComponentCollector({
        time: 30000,
    });

    let currentPage = 0;

    collector.on('collect', async (b) => {
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

        await b.update({ embeds: [embeds[currentPage]], components: [row] });
    });

    collector.on('end', () => {
        home.setDisabled(true);
        back.setDisabled(true);
        next.setDisabled(true);
        interaction.message.edit({ embeds: [embeds[currentPage]], components: [row] });
    });

    collector.on('error', console.error);
}

export async function updateLevel(interaction: Message | CommandInteraction) {
    if (!interaction.guild || !interaction.channel || interaction.channel.type !== ChannelType.GuildText) return;

    try {
        const member = interaction.member as GuildMember;

        if (!member) return;

        if (xpCooldown.has(member.id)) return;

        const levelDb = await LevelConfig.findOne({ GuildId: interaction.guild.id });

        const xpAdd = Math.floor(Math.random() * 11 + 15);
        const score = await Level.findOneAndUpdate(
            { IdJoined: `${member.id}-${interaction.guild.id}` },
            { $inc: { Xp: xpAdd }, $setOnInsert: { UserId: member.id, GuildId: interaction.guild.id, Level: 0 } },
            { upsert: true, new: true },
        ).exec();

        const nxtLvl = (5 / 6) * (score.Level + 1) * (2 * (score.Level + 1) * (score.Level + 1) + 27 * (score.Level + 1) + 91);

        if (nxtLvl <= score.Xp) {
            score.Level += 1;

            await score.save();

            if (!levelDb && interaction.channel.permissionsFor(interaction.guild.members.me!).has(PermissionsBitField.Flags.SendMessages)) {
                interaction.channel.send({ content: `${interaction.member} has reached level **${score.Level}**!`, allowedMentions: { parse: [] } }).then((m) => deletableCheck(m, 10000));
            }
        }

        xpCooldown.add(member.id);
        setTimeout(() => xpCooldown.delete(member.id), xpCooldownSeconds * 1000);
    } catch (error) {
        console.error(error);
    }
}

/**
 * Applies a reversed rainbow effect to the input string.
 * Each character in the string is colored in a sequence of colors in the reversed rainbow order.
 *
 * @param str - The string to which the reversed rainbow effect will be applied.
 * @returns The input string with each character colored according to the reversed rainbow sequence.
 */
export function reversedRainbow(str: string): string {
    // Define color functions that apply the color to the text
    const colorFunctions = {
        red: (text: string) => text.red,
        magenta: (text: string) => text.magenta,
        blue: (text: string) => text.blue,
        green: (text: string) => text.green,
        yellow: (text: string) => text.yellow,
    };

    // Type for valid color names based on the colorFunctions object keys
    type ColorName = keyof typeof colorFunctions;

    // Array of colors to use in the reversed rainbow order
    const colors: ColorName[] = ['red', 'magenta', 'blue', 'green', 'yellow', 'red'];

    // Map each character of the string to its corresponding color and join them back into a string
    return str.split('')
        .map((char, i) => {
            // Determine the color for the current character
            const determineColor = colors[i % colors.length];
            // Apply the color function to the character
            return colorFunctions[determineColor](char);
        })
        .join('');
}
