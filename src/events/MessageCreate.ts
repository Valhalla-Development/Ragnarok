import type { Message, TextBasedChannel } from 'discord.js';
import {
    ContainerBuilder,
    Events,
    MediaGalleryBuilder,
    MessageFlags,
    PermissionsBitField,
    TextDisplayBuilder,
} from 'discord.js';
import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';
import urlRegexSafe from 'url-regex-safe';
import AdsProtection from '../mongo/AdsProtection.js';
import Dad from '../mongo/Dad.js';
import {
    buildAIGroupId,
    isAIChannelAllowed,
    isAIEnabled,
    runAIChat,
} from '../utils/ai/OpenRouter.js';
import { deletableCheck, messageDelete, RagnarokContainer, updateLevel } from '../utils/Util.js';

const dadCooldown = new Set();
const dadCooldownSeconds = 60;

@Discord()
export class MessageCreate {
    /**
     * Handler for messageCreate event.
     * @param args - An array containing the interaction and client objects.
     * @param client - The Discord client.
     */
    @On({ event: Events.MessageCreate })
    async onMessage([message]: ArgsOf<'messageCreate'>, client: Client) {
        if (!message.guild || message.author.bot) {
            return;
        }

        /**
         * Function for protecting against ads and unwanted links in a text-based channel.
         * @remarks This function checks if the AdsProtection feature is enabled in the guild and takes actions accordingly.
         */
        async function adsProtection() {
            const adsProt = await AdsProtection.findOne({ GuildId: message.guild?.id });

            // Check if AdsProtection is enabled in the guild
            if (adsProt) {
                // Check if the bot has the MANAGE_MESSAGES permission
                if (
                    !message.member?.guild.members.me?.permissions.has(
                        PermissionsBitField.Flags.ManageMessages
                    )
                ) {
                    // Bot doesn't have MANAGE_MESSAGES permission, disable Ad Protection
                    const errorContainer = RagnarokContainer(
                        `${client.user?.username ?? 'Bot'} - Ads Protection`,
                        '**Error:** I lack the `Manage Messages` permission required for Ads Protection. This feature has been disabled.'
                    );

                    message.channel
                        .send({ components: [errorContainer], flags: MessageFlags.IsComponentsV2 })
                        .then((m) => deletableCheck(m, 0));
                    await AdsProtection.deleteOne({ GuildId: message.guild?.id });
                    return;
                }

                // Check if the user has MANAGE_MESSAGES permission
                if (
                    !message.member.permissions.has(PermissionsBitField.Flags.ManageMessages) &&
                    urlRegexSafe({ strict: false }).test(message.content.toLowerCase()) &&
                    message.member.guild.members.me.permissions.has(
                        PermissionsBitField.Flags.ManageMessages
                    )
                ) {
                    await messageDelete(message, 0);
                    message.channel
                        .send(
                            `**◎ Link detected:** Your message has been deleted, ${message.author}.`
                        )
                        .then((msg) => {
                            deletableCheck(msg, 5000);
                        });
                }
            }
        }
        await adsProtection();

        /**
         * Asynchronously extracts and handles links to Discord messages in a text message.
         */
        async function linkTag() {
            const discordRegex =
                /https?:\/\/(?:ptb\.)?(?:canary\.)?(discordapp|discord)\.com\/channels\/(\d{1,19})\/(\d{1,19})\/(\d{1,19})/;

            const exec = discordRegex.exec(message.content);

            if (exec && message.guild?.id === exec[2]) {
                const [, , guildID, channelID, messageID] = exec;

                const findGuild = client.guilds.cache.get(guildID as string);
                if (!findGuild) {
                    return;
                }
                const findChannel = findGuild.channels.cache.get(
                    channelID as string
                ) as TextBasedChannel;
                if (!findChannel) {
                    return;
                }
                const validExtensions = ['gif', 'png', 'jpeg', 'jpg'];

                const messagePromises = [
                    findChannel.messages.fetch({ message: messageID as string }),
                    findChannel.messages.fetch({ message: messageID as string, cache: false }),
                ];
                const settledPromises = await Promise.allSettled(messagePromises);
                const resolvedPromise = settledPromises.find(
                    (result) => result.status === 'fulfilled'
                ) as PromiseFulfilledResult<Message | undefined>;

                if (resolvedPromise) {
                    const res = resolvedPromise.value;

                    if (res) {
                        const unixEpochTimestamp = Math.floor(res.createdTimestamp / 1000);
                        const user = client.users.cache.get(res.author.id);

                        const attachmentCheck = res.attachments.first();
                        const quoteLines = [
                            `# ${user?.displayName || message.author.displayName}`,
                            `**Author Avatar:** ${user?.displayAvatarURL({ extension: 'png' }) || message.author.displayAvatarURL({ extension: 'png' })}`,
                            `**Quoted by:** ${message.author.displayName}`,
                            '',
                        ];
                        let quoteText = '';
                        let imageUrl: string | null = null;

                        if (res.content && attachmentCheck) {
                            const attachmentUrl = attachmentCheck.url;
                            const fileExtension = attachmentUrl.substring(
                                attachmentUrl.lastIndexOf('.') + 1
                            );
                            if (validExtensions.includes(fileExtension)) {
                                quoteText = `**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>\n${res.content.substring(0, 1048)}`;
                                imageUrl = attachmentUrl;
                            } else {
                                quoteText = `**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>\n${res.content.substring(0, 1048)}`;
                            }
                        } else if (res.content) {
                            quoteText = `**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>\n${res.content.substring(0, 1048)}`;
                        } else if (attachmentCheck) {
                            const attachmentUrl = attachmentCheck.url;
                            const fileExtension = attachmentUrl.substring(
                                attachmentUrl.lastIndexOf('.') + 1
                            );
                            if (validExtensions.includes(fileExtension)) {
                                quoteText = `**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>`;
                                imageUrl = attachmentUrl;
                            } else {
                                quoteText = `**[Message Link](${exec[0]}) ➜** ${exec[0]} - <t:${unixEpochTimestamp}>`;
                            }
                        }
                        quoteLines.push(quoteText);

                        const container = new ContainerBuilder().addTextDisplayComponents(
                            new TextDisplayBuilder().setContent(quoteLines.join('\n'))
                        );
                        if (imageUrl) {
                            container.addMediaGalleryComponents(
                                new MediaGalleryBuilder().addItems((item) => item.setURL(imageUrl!))
                            );
                        }
                        message.channel.send({
                            components: [container],
                            flags: MessageFlags.IsComponentsV2,
                        });
                    }
                }
            }
        }
        await linkTag();

        async function dadBot() {
            const dadData = await Dad.findOne({ GuildId: message.guild?.id });
            if (!dadData || dadCooldown.has(message.author.id)) {
                return;
            }

            const messageContent = message.content.toLowerCase();
            if (!(messageContent.startsWith('im ') || messageContent.startsWith("i'm "))) {
                return;
            }

            const content = messageContent.split(' ').slice(1).join(' ');

            switch (true) {
                case urlRegexSafe({ strict: false }).test(messageContent):
                    message.channel.send({ files: ['./Storage/Images/dadNo.png'] });
                    break;
                case messageContent.startsWith('im dad') || messageContent.startsWith("i'm dad"):
                    message.channel.send({ content: "No, I'm Dad!" });
                    break;
                case messageContent.includes('@everyone') || messageContent.includes('@here'):
                    await message.reply({ content: '<:pepebruh:987742251297931274>' });
                    break;
                default:
                    message.channel.send({ content: `Hi ${content}, I'm Dad!` });
            }

            dadCooldown.add(message.author.id);
            setTimeout(() => dadCooldown.delete(message.author.id), dadCooldownSeconds * 1000);
        }
        await dadBot();

        /**
         * AI chatbot (mention-based)
         */
        async function aiChatbot() {
            if (!(isAIEnabled() && client.user)) {
                return;
            }
            if (!(await isAIChannelAllowed(message.guildId, message.channelId))) {
                return;
            }

            const isMentioningBot = message.mentions.has(client.user.id);
            let isReplyingToBot = false;

            if (message.reference?.messageId) {
                const repliedMessage = await message.channel.messages
                    .fetch(message.reference.messageId)
                    .catch(() => null);
                isReplyingToBot = repliedMessage?.author.id === client.user.id;
            }

            if (!(isMentioningBot || isReplyingToBot)) {
                return;
            }

            const prompt = message.content.replace(/<@!?(\d+)>/g, '').trim();
            if (prompt.length < 4) {
                return;
            }

            await message.channel.sendTyping();

            const groupId = buildAIGroupId({
                guildId: message.guild?.id,
                channelId: message.channel.id,
                threadId: message.channel.isThread() ? message.channel.id : null,
                userId: message.author.id,
            });

            const result = await runAIChat({
                userId: message.author.id,
                groupId,
                prompt,
                displayName: message.member?.displayName ?? message.author.displayName,
            });

            if (!result.ok) {
                await message.reply({
                    content: result.message,
                    allowedMentions: { parse: [], repliedUser: false },
                });
                return;
            }

            const [first, ...rest] = result.chunks;
            await message.reply({
                content: first,
                allowedMentions: { parse: [], repliedUser: false },
            });
            for (const chunk of rest) {
                await message.channel.send({
                    content: chunk,
                    allowedMentions: { parse: [] },
                });
            }
        }
        await aiChatbot();

        /**
         * Easter Eggs
         */
        if (message.content.includes('(╯°□°）╯︵ ┻━┻')) {
            await message.reply({
                content: 'Leave my table alone!\n┬─┬ ノ( ゜-゜ノ)',
            });
        }

        /**
         * Update Level module
         */
        await updateLevel(message);
    }
}
