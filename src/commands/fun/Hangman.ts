import { Category } from '@discordx/utilities';
import axios, { type AxiosResponse } from 'axios';
import {
    AttachmentBuilder,
    ChannelType,
    type CommandInteraction,
    ContainerBuilder,
    type Message,
    MessageFlags,
    PermissionsBitField,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    type ThreadChannel,
} from 'discord.js';
import { Discord, Slash } from 'discordx';
import { config, isValhallaEnabled } from '../../config/Config.js';
import {
    deletableCheck,
    getRandomWord,
    messageDelete,
    RagnarokComponent,
} from '../../utils/Util.js';

const cooldown = new Map();
const cooldownSeconds = 1;

@Discord()
@Category('Miscellaneous')
export class Hangman {
    @Slash({ description: 'Test your word-guessing skills in a thrilling game of Hangman' })
    async hangman(interaction: CommandInteraction) {
        if (!interaction.channel || interaction.channel.type !== ChannelType.GuildText) {
            return;
        }

        if (
            !interaction.guild?.members.me?.permissions.has(
                PermissionsBitField.Flags.CreatePublicThreads
            )
        ) {
            await RagnarokComponent(
                interaction,
                'Error',
                'I need the **Create Public Threads** permission to start a Hangman game.',
                true
            );
            return;
        }

        if (!isValhallaEnabled()) {
            await RagnarokComponent(
                interaction,
                'Disabled',
                'Hangman is currently disabled (missing `VALHALLA_API_KEY`).',
                true
            );
            return;
        }

        const word = await getRandomWord();

        if (!word) {
            await RagnarokComponent(
                interaction,
                'Error',
                "Couldn't start Hangman (failed to get a word). Please try again in a moment.",
                true
            );
            return;
        }

        await interaction.deferReply();
        await interaction.deleteReply();

        const gameState = {
            word: word.toLowerCase(),
            guessed: '',
            hangmanState: 0,
            showWord: false,
        };

        const buildThreadNotice = (title: string, lines: string[]) =>
            new ContainerBuilder()
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(`## 🪓 ${title}`))
                .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
                .addTextDisplayComponents(new TextDisplayBuilder().setContent(lines.join('\n')));

        async function updateGameImage(channel: ThreadChannel, messageToUpdate?: Message) {
            let response: AxiosResponse<Buffer>;
            try {
                response = await axios.get(`${config.VALHALLA_API_URI}/hangman`, {
                    params: {
                        api_key: `${config.VALHALLA_API_KEY}`,
                        word: gameState.word,
                        guessed: gameState.guessed,
                        hangmanState: gameState.hangmanState,
                        showWord: gameState.showWord,
                    },
                    responseType: 'arraybuffer',
                    headers: { Authorization: `Bearer ${config.VALHALLA_API_KEY}` },
                });

                const attachment = new AttachmentBuilder(response.data, { name: 'Hangman.jpg' });

                if (messageToUpdate) {
                    return messageToUpdate.edit({ files: [attachment] });
                }
                return channel.send({ files: [attachment] });
            } catch {
                await channel.send({
                    components: [
                        buildThreadNotice('Error', [
                            '❌ I could not generate the Hangman board right now.',
                            'Please try again in a moment.',
                        ]),
                    ],
                    flags: MessageFlags.IsComponentsV2,
                });
                return;
            }
        }

        // Create thread
        const thread = await interaction.channel.threads.create({
            name: `Hangman - @${interaction.user.username}`,
            autoArchiveDuration: 60,
            reason: `Hangman game started by ${interaction.user.username}`,
        });

        const gameMessage = await updateGameImage(thread);

        const letterPattern = /^[a-zA-Z]$/;
        const filter = (m: Message) => !m.author.bot;
        const collector = thread.createMessageCollector({ filter, time: 30_000 });
        collector.on('collect', async (m) => {
            if (m.author.id !== interaction.user.id) {
                await m
                    .reply({
                        components: [
                            buildThreadNotice('Not your game', [
                                `Only ${interaction.member} can play this Hangman game.`,
                            ]),
                        ],
                        flags: MessageFlags.IsComponentsV2,
                        allowedMentions: { repliedUser: false },
                    })
                    .then((ms) => deletableCheck(ms, 2500));
                await messageDelete(m, 0);
                return;
            }

            if (!gameMessage) {
                // The API call failed; inform the user and stop the game
                await m
                    .reply({
                        components: [
                            buildThreadNotice('Error', [
                                '❌ The Hangman board could not be generated.',
                                'Please try again later.',
                            ]),
                        ],
                        flags: MessageFlags.IsComponentsV2,
                    })
                    .then((ms) => deletableCheck(ms, 2500));
                collector.stop();
                return;
            }

            collector.resetTimer();

            const remainingCooldown = cooldown.get(interaction.user.id) - Date.now();
            if (remainingCooldown > 0) {
                const remainingSeconds = Math.ceil(remainingCooldown / 1000);
                m.reply({
                    components: [
                        buildThreadNotice('Slow down', [
                            `Please wait **${remainingSeconds}s** before guessing again.`,
                        ]),
                    ],
                    flags: MessageFlags.IsComponentsV2,
                }).then((ms) => deletableCheck(ms, 2500));
                await messageDelete(m, 2500);
                return;
            }

            cooldown.delete(interaction.user.id);

            if (!cooldown.has(interaction.user.id)) {
                const cooldownEnd = Date.now() + cooldownSeconds * 1000;
                cooldown.set(interaction.user.id, cooldownEnd);
            }

            if (m.content.length > 1) {
                if (m.content.length === gameState.word.length) {
                    if (m.content.toLowerCase() === gameState.word.toLowerCase()) {
                        // Word is fully guessed
                        gameState.guessed = gameState.word;
                        gameState.showWord = true;
                        await updateGameImage(thread, gameMessage);
                        thread.send({
                            components: [
                                buildThreadNotice('Winner', [
                                    `✅ ${interaction.member} solved the word!`,
                                    `**Answer:** \`${gameState.word}\``,
                                ]),
                            ],
                            flags: MessageFlags.IsComponentsV2,
                        });
                        collector.stop();
                        return;
                    }
                    // entered full word, wrong answer
                    await m
                        .reply({
                            components: [
                                buildThreadNotice('Incorrect', ['❌ Wrong word. Try again.']),
                            ],
                            flags: MessageFlags.IsComponentsV2,
                        })
                        .then((ms) => deletableCheck(ms, 2500));
                    await messageDelete(m, 2500);
                } else {
                    await m
                        .reply({
                            components: [
                                buildThreadNotice('Invalid input', [
                                    'Please guess **one letter** at a time.',
                                    `Or guess the **full word** (${gameState.word.length} letters).`,
                                ]),
                            ],
                            flags: MessageFlags.IsComponentsV2,
                        })
                        .then((ms) => deletableCheck(ms, 2500));
                    await messageDelete(m, 2500);
                    return;
                }
            }

            if (!letterPattern.test(m.content)) {
                await messageDelete(m, 0);
                return;
            }

            // If letter has already been guessed
            if (gameState && letterPattern.test(m.content)) {
                const letter = m.content.toLowerCase();
                if (gameState.guessed.includes(letter)) {
                    await m
                        .reply({
                            components: [
                                buildThreadNotice('Already guessed', [
                                    `You've already guessed \`${letter}\`. Try a different letter.`,
                                ]),
                            ],
                            flags: MessageFlags.IsComponentsV2,
                        })
                        .then((ms) => deletableCheck(ms, 2500));
                    await messageDelete(m, 2500);
                } else {
                    if (!gameState.word.includes(letter)) {
                        gameState.hangmanState += 1;

                        if (gameState.hangmanState >= 10) {
                            // Game has ended
                            gameState.showWord = true;
                            thread.send({
                                components: [
                                    buildThreadNotice('Game over', [
                                        '❌ No attempts left.',
                                        `**Answer:** \`${gameState.word}\``,
                                    ]),
                                ],
                                flags: MessageFlags.IsComponentsV2,
                            });
                            await messageDelete(m, 0);
                            collector.stop();
                        }
                    }

                    gameState.guessed += letter;
                    await updateGameImage(thread, gameMessage);
                    await messageDelete(m, 0);

                    // Check if the word has been fully guessed
                    const remainingLetters = gameState.word
                        .split('')
                        .filter((char) => !gameState.guessed.includes(char));
                    if (remainingLetters.length === 0) {
                        // Word is fully guessed
                        gameState.showWord = true;
                        await updateGameImage(thread, gameMessage);
                        thread.send({
                            components: [
                                buildThreadNotice('Winner', [
                                    `✅ ${interaction.member} solved the word!`,
                                    `**Answer:** \`${gameState.word}\``,
                                ]),
                            ],
                            flags: MessageFlags.IsComponentsV2,
                        });
                        collector.stop();
                    }
                }
            }
        });

        collector.on('end', async (_, reason) => {
            if (!gameMessage) {
                // The API call failed; don't send the end message
                await thread.setLocked(true);
                return;
            }
            if (reason === 'time') {
                gameState.hangmanState = 10;
                gameState.showWord = true;
                await updateGameImage(thread, gameMessage);
                thread.send({
                    components: [
                        buildThreadNotice('Time is up', [
                            '⏱️ You ran out of time.',
                            `**Answer:** \`${gameState.word}\``,
                        ]),
                    ],
                    flags: MessageFlags.IsComponentsV2,
                });
            }
            await thread.setLocked(true);
        });
    }
}
