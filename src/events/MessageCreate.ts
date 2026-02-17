import type { Message, TextBasedChannel } from 'discord.js';
import {
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    Events,
    MediaGalleryBuilder,
    MessageFlags,
    PermissionsBitField,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
} from 'discord.js';
import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';
import urlRegexSafe from 'url-regex-safe';
import AdsProtection from '../mongo/AdsProtection.js';
import Dad from '../mongo/Dad.js';
import Rock from '../mongo/Rock.js';
import {
    buildAIGroupId,
    getEffectivePersonaId,
    isAIChannelAllowed,
    isAIEnabled,
    runAIChat,
} from '../utils/ai/Index.js';
import { deletableCheck, messageDelete, RagnarokContainer, updateLevel } from '../utils/Util.js';

const dadCooldown = new Set<string>();
const dadCooldownSeconds = 10;

const rockCooldown = new Set<string>();
const rockCooldownSeconds = 10;

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
                        const user = client.users.cache.get(res.author.id);
                        const authorAvatar =
                            user?.displayAvatarURL({ extension: 'png' }) ||
                            message.author.displayAvatarURL({ extension: 'png' });

                        const imageAttachment = res.attachments.find((attachment) => {
                            const contentType = attachment.contentType?.toLowerCase() ?? '';
                            if (contentType.startsWith('image/')) {
                                return true;
                            }

                            if (typeof attachment.width === 'number' && attachment.width > 0) {
                                return true;
                            }

                            const normalizedUrl = attachment.url.toLowerCase().split('?')[0] ?? '';
                            const fileExtension = normalizedUrl.substring(
                                normalizedUrl.lastIndexOf('.') + 1
                            );
                            return validExtensions.includes(fileExtension);
                        });
                        const normalizedText = res.content.trim();
                        const hasTextContent = normalizedText.length > 0;
                        const clippedText = hasTextContent
                            ? normalizedText.slice(0, 900)
                            : imageAttachment
                              ? '[Image attachment]'
                              : '[No text content]';
                        const quoteLines = [
                            '### 💬 Message Quote',
                            `**Author:** <@${res.author.id}>`,
                            `**Quoted by:** <@${message.author.id}>`,
                            '',
                            `> ${clippedText}`,
                        ];
                        let imageUrl: string | null = null;

                        if (imageAttachment) {
                            imageUrl = imageAttachment.url;
                        }

                        const summarySection = new SectionBuilder()
                            .addTextDisplayComponents(
                                new TextDisplayBuilder().setContent(quoteLines.join('\n'))
                            )
                            .setThumbnailAccessory(new ThumbnailBuilder().setURL(authorAvatar));

                        const container = new ContainerBuilder()
                            .addSectionComponents(summarySection)
                            .addActionRowComponents((row) =>
                                row.addComponents(
                                    new ButtonBuilder()
                                        .setStyle(ButtonStyle.Link)
                                        .setURL(exec[0]!)
                                        .setLabel('Jump to Message')
                                        .setEmoji('🔗')
                                )
                            );
                        if (imageUrl) {
                            container.addMediaGalleryComponents(
                                new MediaGalleryBuilder().addItems((item) => item.setURL(imageUrl!))
                            );
                        }
                        message.channel.send({
                            components: [container],
                            flags: MessageFlags.IsComponentsV2,
                            allowedMentions: { parse: [] },
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

            const messageContent = message.content.toLowerCase().trim();
            if (!(messageContent.startsWith('im ') || messageContent.startsWith("i'm "))) {
                return;
            }

            const content = messageContent.split(' ').slice(1).join(' ');

            dadCooldown.add(message.author.id);
            setTimeout(() => dadCooldown.delete(message.author.id), dadCooldownSeconds * 1000);

            switch (true) {
                case urlRegexSafe({ strict: false }).test(messageContent):
                    await message.reply({ files: ['./assets/fun/dadNo.png'] });
                    break;
                case messageContent.startsWith('im dad') || messageContent.startsWith("i'm dad"):
                    await message.reply({ content: "No, I'm Dad!" });
                    break;
                case messageContent.includes('@everyone') || messageContent.includes('@here'):
                    await message.reply({ content: '<:pepebruh:987742251297931274>' });
                    break;
                default:
                    await message.reply({ content: `Hi ${content}, I'm Dad!` });
            }
        }
        await dadBot();

        async function rockBot() {
            const rockData = await Rock.findOne({ GuildId: message.guild?.id });
            if (rockData?.Status === false || rockCooldown.has(message.author.id)) {
                return;
            }
            const content = message.content.toLowerCase().trim();
            const rockPhrase = /i\s*don'?t\s+like\s+this\s+rock/i;
            if (!rockPhrase.test(content)) {
                return;
            }
            rockCooldown.add(message.author.id);
            setTimeout(() => rockCooldown.delete(message.author.id), rockCooldownSeconds * 1000);
            await message.reply({ files: ['./assets/fun/sensitive.mov'] });
        }
        await rockBot();

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

            const hasExplicitBotMention = new RegExp(`<@!?${client.user.id}>`).test(
                message.content
            );
            let referencedMessage: Message | null = null;
            let isReplyingToBot = false;
            let isReplyingToOtherUser = false;

            if (message.reference?.messageId) {
                referencedMessage = await message.channel.messages
                    .fetch(message.reference.messageId)
                    .catch(() => null);
                isReplyingToBot = referencedMessage?.author.id === client.user.id;
                isReplyingToOtherUser = Boolean(
                    referencedMessage?.author.id &&
                        referencedMessage.author.id !== client.user.id &&
                        referencedMessage.author.id !== message.author.id
                );
            }
            const isReplyingToSelf = referencedMessage?.author.id === message.author.id;

            if (!(hasExplicitBotMention || isReplyingToBot)) {
                return;
            }

            // Clean current message of mentions
            const cleanedPrompt = message.content.replace(/<@!?\d+>/g, '').trim();

            // Process quoted message content with readable mention replacement
            const getQuotedContent = (msg: Message) => {
                if (!msg.content) {
                    return '[No text content]';
                }

                const processed = msg.content.replace(/<@!?(\d+)>/g, (match, id) => {
                    if (id === client.user?.id) {
                        return '';
                    }

                    const name =
                        msg.mentions.members?.get(id)?.displayName ??
                        msg.mentions.users?.get(id)?.username;
                    return name ? `@${name}` : match;
                });

                return processed.replace(/\s+/g, ' ').trim() || '[No text content]';
            };

            const quotedContent = referencedMessage
                ? getQuotedContent(referencedMessage)
                : '[No text content]';

            // Build prompt based on context
            let prompt = '';

            if (hasExplicitBotMention && isReplyingToOtherUser && referencedMessage) {
                // Replying to another user with bot mention
                const instruction = `Reply target: "${quotedContent}" quoted from "${referencedMessage.author.displayName}"`;
                const addressNote =
                    '\n\nAddress your reply to the person quoted above, not to the person who sent this message. Do not output any preamble like "To the user..." or "To [name]:". Just reply directly as if talking to them.';

                prompt = `${cleanedPrompt || 'The user wants you to respond to the reply target.'}\n\n${instruction}${addressNote}`;
            } else if (isReplyingToSelf && referencedMessage) {
                // Replying to self - use quoted content
                prompt = quotedContent;
            } else {
                // Direct message to bot
                prompt = cleanedPrompt;
            }

            if (prompt.length < 2) {
                return;
            }

            await message.channel.sendTyping();

            const groupId = buildAIGroupId({
                guildId: message.guild?.id,
                channelId: message.channel.id,
                threadId: message.channel.isThread() ? message.channel.id : null,
                userId: message.author.id,
            });

            const personaId = await getEffectivePersonaId(
                message.author.id,
                message.guild?.id ?? null
            );
            const result = await runAIChat({
                userId: message.author.id,
                groupId,
                prompt,
                displayName: message.member?.displayName ?? message.author.displayName,
                botName: message.guild?.members.me?.displayName ?? client.user?.displayName,
                personaId,
            });

            if (!result.ok) {
                await message.reply({
                    content: result.message,
                    allowedMentions: { parse: [], repliedUser: false },
                });
                return;
            }

            const [first, ...rest] = result.chunks;
            const shouldReplyToReferenced =
                referencedMessage &&
                ((hasExplicitBotMention && isReplyingToOtherUser) || isReplyingToSelf);
            if (shouldReplyToReferenced && referencedMessage) {
                await message.channel.send({
                    content: first,
                    reply: { messageReference: referencedMessage.id },
                    allowedMentions: { parse: [], repliedUser: true },
                });
            } else {
                await message.reply({
                    content: first,
                    allowedMentions: { parse: [], repliedUser: false },
                });
            }
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
        if (message.content.includes('(╯°□°)╯︵ ┻━┻')) {
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
