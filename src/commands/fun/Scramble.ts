import { Category } from '@discordx/utilities';
import {
    ActionRowBuilder,
    ButtonBuilder,
    type ButtonInteraction,
    ButtonStyle,
    ChannelType,
    type CommandInteraction,
    ContainerBuilder,
    MessageFlags,
    ModalBuilder,
    type ModalSubmitInteraction,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    TextInputBuilder,
    TextInputStyle,
} from 'discord.js';
import { ButtonComponent, Discord, ModalComponent, Slash } from 'discordx';
import { v4 as uuidv4 } from 'uuid';
import { isValhallaEnabled } from '../../config/Config.js';
import { capitalise, fetchAndScrambleWord, RagnarokComponent } from '../../utils/Util.js';

class Game {
    gameIsActive: boolean;

    originalWord!: string;

    scrambledWord!: string;

    pronunciation!: string;

    partOfSpeech!: string;

    definition!: string[];

    fieldArray!: { name: string; value: string }[];

    constructor() {
        this.gameIsActive = true;
    }
}

const activeGames: Record<string, Game> = {};

@Discord()
@Category('Miscellaneous')
export class Scramble {
    /**
     * Creates a Components V2 container for displaying the scrambled word to users.
     * @param game - The current game being played.
     * @param gameId - The current game id.
     * @returns A ContainerBuilder object.
     */
    private createScrambleContainer(game: Game, gameId: string): ContainerBuilder {
        const answerButton = new ButtonBuilder()
            .setCustomId(`scramble_guess-${gameId}`)
            .setLabel('Answer')
            .setStyle(ButtonStyle.Success);

        return new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('## 🔀 Scramble'))
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(
                    [
                        `**Scrambled:** \`${game.scrambledWord.toLowerCase()}\``,
                        '',
                        'Click **Answer** to submit your guess.',
                    ].join('\n')
                )
            )
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addActionRowComponents((row) => row.addComponents(answerButton));
    }

    /**
     * Builds the win/timeout screen using the exact WOTD-style layout:
     * header -> (extra) winner section -> definition -> link button
     */
    private createWotdStyleResultContainer(opts: {
        topTitle: string;
        topLines: string[];
        word: string;
        pronunciation: string;
        partOfSpeech: string;
        definition?: string[];
        linkUrl: string;
        linkLabel: string;
    }): ContainerBuilder {
        const topDisplay = new TextDisplayBuilder().setContent(
            [`# ${opts.topTitle}`, '', ...opts.topLines.map((l) => `> ${l}`)].join('\n')
        );

        const headerText = new TextDisplayBuilder().setContent(
            [
                '## 📖 Word Details',
                `> **${capitalise(opts.word)}**`,
                `> *[ ${opts.pronunciation} ]*`,
                `> *${opts.partOfSpeech}*`,
            ].join('\n')
        );

        const container = new ContainerBuilder()
            .addTextDisplayComponents(topDisplay)
            .addSeparatorComponents((separator) => separator.setSpacing(SeparatorSpacingSize.Large))
            .addTextDisplayComponents(headerText);

        if (opts.definition?.length) {
            const definitionDisplay = new TextDisplayBuilder().setContent(
                ['## 📘 Definition', '', `>>> *${opts.definition.join('\n')}*`].join('\n')
            );
            container
                .addSeparatorComponents((separator) =>
                    separator.setSpacing(SeparatorSpacingSize.Large)
                )
                .addTextDisplayComponents(definitionDisplay);
        }

        container.addSeparatorComponents((separator) =>
            separator.setSpacing(SeparatorSpacingSize.Small)
        );

        const sourceButton = new ButtonBuilder()
            .setLabel(opts.linkLabel)
            .setStyle(ButtonStyle.Link)
            .setURL(opts.linkUrl);

        container.addActionRowComponents((row) => row.addComponents(sourceButton));

        return container;
    }

    /**
     * Plays a game of word scrambling.
     * @param interaction - The CommandInteraction object that represents the user's interaction with the bot.
     */
    @Slash({ description: 'Unscramble a jumbled word in this fun and challenging game' })
    async scramble(interaction: CommandInteraction) {
        if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
            return;
        }
        // Ephemeral ack while we fetch a word; the actual game message is posted publicly.
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        if (!isValhallaEnabled()) {
            await RagnarokComponent(
                interaction,
                'Disabled',
                'Scramble is currently disabled (missing `VALHALLA_API_KEY`).',
                true
            );
            return;
        }

        const game = new Game();
        const gameId = uuidv4(); // Generate a unique id for the game
        activeGames[gameId] = game; // Store the game state in the activeGames object

        try {
            const {
                originalWord,
                scrambledWord,
                pronunciation,
                partOfSpeech,
                definition,
                fieldArray,
            } = await fetchAndScrambleWord();
            game.originalWord = originalWord;
            game.scrambledWord = scrambledWord;
            game.pronunciation = pronunciation;
            game.partOfSpeech = partOfSpeech;
            game.definition = definition;
            game.fieldArray = fieldArray;

            const container = this.createScrambleContainer(game, gameId);

            const initial = await interaction.channel.send({
                components: [container],
                flags: MessageFlags.IsComponentsV2,
            });
            await interaction.deleteReply();

            setTimeout(
                async () => {
                    if (game.gameIsActive) {
                        game.gameIsActive = false;
                        delete activeGames[gameId];

                        const ended = this.createWotdStyleResultContainer({
                            topTitle: 'Scramble Ended',
                            topLines: [
                                `Scrambled: \`${game.scrambledWord.toLowerCase()}\``,
                                "Time's up — nobody solved it.",
                                `Answer: **${capitalise(game.originalWord)}**`,
                            ],
                            word: game.originalWord,
                            pronunciation: game.pronunciation,
                            partOfSpeech: game.partOfSpeech,
                            definition: game.definition,
                            linkUrl: `https://www.merriam-webster.com/dictionary/${game.originalWord}`,
                            linkLabel: 'Explore this word',
                        });

                        await initial.edit({
                            components: [ended],
                            flags: MessageFlags.IsComponentsV2,
                        });
                    }
                },
                10 * 60 * 1000
            ); // 10 minutes
        } catch (error) {
            console.error(error);
            delete activeGames[gameId];
            await RagnarokComponent(
                interaction,
                'Error',
                "Couldn't start a Scramble game right now (word service unavailable). Try again in a moment.",
                true
            );
        }
    }

    /**
     * Handles button click events from the "Answer" button.
     * @param interaction - The ButtonInteraction object that represents the user's interaction with the button.
     */
    @ButtonComponent({ id: /^scramble_guess-/ })
    async buttonClicked(interaction: ButtonInteraction) {
        const gameId = interaction.customId.match(/scramble_(?:guess|modal)-([a-f0-9-]+)/i)?.[1]; // Extract the gameId from the custom id
        if (!gameId) {
            return;
        }

        if (!activeGames[gameId]) {
            await interaction.reply({
                components: [],
                content: 'This game is no longer active.',
                flags: [MessageFlags.Ephemeral],
            });
            return;
        }

        const modal = new ModalBuilder()
            .setTitle('Scramble Word')
            .setCustomId(`scramble_modal-${gameId}`);
        const input = new TextInputBuilder()
            .setCustomId('modalField')
            .setLabel('Input')
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(1)
            .setMaxLength(20);

        const inputRow = new ActionRowBuilder<TextInputBuilder>().addComponents(input);
        modal.addComponents(inputRow);
        await interaction.showModal(modal);
    }

    /**
     * Handles modal submit events for the "Answer" button.
     * @param interaction - The ModalSubmitInteraction object that represents the user's interaction with the modal.
     */
    @ModalComponent({ id: /^scramble_modal-/ })
    async handleModalSubmit(interaction: ModalSubmitInteraction): Promise<void> {
        const gameId = interaction.customId.match(/scramble_(?:guess|modal)-([a-f0-9-]+)/i)?.[1]; // Extract the gameId from the custom id
        if (!gameId) {
            return;
        }
        const game = activeGames[gameId]; // Get the game state using the gameId

        if (!game) {
            await interaction.reply({
                content: 'This game is no longer active.',
                flags: [MessageFlags.Ephemeral],
            });
            return;
        }

        const [modalField] = ['modalField'].map((id) => interaction.fields.getTextInputValue(id));

        if (!modalField) {
            await interaction.reply({
                content: 'No answer provided.',
                flags: [MessageFlags.Ephemeral],
            });
            return;
        }

        // Always ack the modal submit to avoid "interaction failed" when we only edit the game message.
        await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

        if (game.gameIsActive) {
            if (modalField.toLowerCase() === game.originalWord.toLowerCase()) {
                game.gameIsActive = false;
                delete activeGames[gameId];

                if (!interaction.isFromMessage()) {
                    return;
                }
                if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
                    return;
                }

                const ended = this.createWotdStyleResultContainer({
                    topTitle: '🏆 Scramble Winner',
                    topLines: [
                        `Solved by: ${interaction.user}`,
                        `Scrambled: \`${game.scrambledWord.toLowerCase()}\``,
                        `Answer: **${capitalise(game.originalWord)}**`,
                    ],
                    word: game.originalWord,
                    pronunciation: game.pronunciation,
                    partOfSpeech: game.partOfSpeech,
                    definition: game.definition,
                    linkUrl: `https://www.merriam-webster.com/dictionary/${game.originalWord}`,
                    linkLabel: 'Explore this word',
                });

                await interaction.message?.edit({
                    components: [ended],
                    flags: MessageFlags.IsComponentsV2,
                });

                // We don't need to show a separate "Correct" message; just remove the deferred ack.
                await interaction.deleteReply().catch(() => null);
            } else {
                await RagnarokComponent(
                    interaction,
                    'Incorrect',
                    `❌ \`${modalField}\` is not correct.`,
                    true
                );
            }
        } else {
            await RagnarokComponent(interaction, 'Info', 'This game has already ended.', true);
        }
    }
}
