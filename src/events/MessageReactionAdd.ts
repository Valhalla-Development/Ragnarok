import {
    type APIMessageTopLevelComponent,
    ContainerBuilder,
    Events,
    MediaGalleryBuilder,
    MessageFlags,
    TextDisplayBuilder,
} from 'discord.js';
import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';
import {
    findStarboardEntry,
    getStarboardChannel,
    isImageAttachment,
    isStarEmoji,
    parseStarMessageMeta,
    removeSelfStar,
    resolveMessage,
    resolveReaction,
} from './Starboard.shared.js';

@Discord()
export class MessageReactionAdd {
    private static readonly STAR_META_REGEX = /⭐\s\d+\s\|\s\d{17,20}/;

    private buildStarboardContainer(
        authorTag: string,
        authorAvatar: string,
        channelId: string,
        content: string,
        messageUrl: string,
        starCount: number,
        sourceMessageId: string,
        imageUrl: string | null
    ): ContainerBuilder {
        const lines = [
            '# Starboard',
            `**Author:** ${authorTag}`,
            `**Avatar:** ${authorAvatar}`,
            `**Channel:** <#${channelId}>`,
            `**Message:** ${content.trim() ? content.substring(0, 1024) : 'N/A'}`,
            `**Jump:** [Jump To Message](${messageUrl})`,
            `⭐ ${starCount} | ${sourceMessageId}`,
        ];

        const container = new ContainerBuilder().addTextDisplayComponents(
            new TextDisplayBuilder().setContent(lines.join('\n'))
        );

        if (imageUrl) {
            container.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems((item) => item.setURL(imageUrl))
            );
        }

        return container;
    }

    private getUpdatedComponents(
        sourceMessage: { components: readonly unknown[] },
        starCount: number,
        sourceMessageId: string
    ): APIMessageTopLevelComponent[] {
        const nextMeta = `⭐ ${starCount} | ${sourceMessageId}`;
        const rows = sourceMessage.components.map((row) => {
            const rowJson =
                typeof row === 'object' &&
                row !== null &&
                'toJSON' in row &&
                typeof (row as { toJSON?: () => unknown }).toJSON === 'function'
                    ? (row as { toJSON: () => unknown }).toJSON()
                    : row;

            if (!rowJson || typeof rowJson !== 'object') {
                return null;
            }
            const rowData = rowJson as { type?: number; components?: unknown[] };
            if (!Array.isArray(rowData.components)) {
                return rowData as APIMessageTopLevelComponent;
            }

            return {
                ...rowData,
                components: rowData.components.map((component) => {
                    if (!component || typeof component !== 'object') {
                        return component;
                    }
                    const componentData = component as { type?: number; content?: string };
                    if (
                        componentData.type !== 10 ||
                        typeof componentData.content !== 'string' ||
                        !MessageReactionAdd.STAR_META_REGEX.test(componentData.content)
                    ) {
                        return componentData;
                    }
                    return {
                        ...componentData,
                        content: componentData.content.replace(
                            MessageReactionAdd.STAR_META_REGEX,
                            nextMeta
                        ),
                    };
                }),
            } as APIMessageTopLevelComponent;
        });
        return rows.filter((row): row is APIMessageTopLevelComponent => row !== null);
    }

    @On({ event: Events.MessageReactionAdd })
    async onReactionAdd([reaction, user]: ArgsOf<'messageReactionAdd'>, client: Client) {
        if (user.bot || !isStarEmoji(reaction)) {
            return;
        }

        const resolvedReaction = await resolveReaction(reaction);
        if (!resolvedReaction) {
            return;
        }

        const message = await resolveMessage(resolvedReaction.message);
        if (!message?.guild || message.author?.bot) {
            return;
        }

        const starChannel = await getStarboardChannel(message);
        if (!starChannel) {
            return;
        }

        // Prevent users starring their own messages (OG behavior).
        await removeSelfStar(resolvedReaction, user);
        const safeStarCount = Math.max(
            0,
            (resolvedReaction.count ?? 0) - (message.author?.id === user.id ? 1 : 0)
        );
        if (safeStarCount < 1) {
            return;
        }

        // If the reaction happened on a starboard message, only update its footer count.
        if (message.channelId === starChannel.id) {
            const parsed = parseStarMessageMeta(message);
            if (!parsed) {
                return;
            }

            const updatedComponents = this.getUpdatedComponents(
                message,
                safeStarCount,
                parsed.sourceMessageId
            );
            await message.edit({
                components: updatedComponents,
                flags: MessageFlags.IsComponentsV2,
            });
            return;
        }

        const existingStarboardMessage = await findStarboardEntry(starChannel, message.id);
        if (existingStarboardMessage) {
            const updatedComponents = this.getUpdatedComponents(
                existingStarboardMessage,
                safeStarCount,
                message.id
            );
            await existingStarboardMessage.edit({
                components: updatedComponents,
                flags: MessageFlags.IsComponentsV2,
            });
            return;
        }

        const attachment = message.attachments.first();
        const imageUrl =
            attachment?.url && isImageAttachment(attachment.url) ? attachment.url : null;

        const container = this.buildStarboardContainer(
            `${message.author}`,
            message.author.displayAvatarURL({ extension: 'png' }),
            message.channel.id,
            message.content ?? '',
            message.url,
            safeStarCount,
            message.id,
            imageUrl
        );

        const sent = await starChannel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { parse: [] },
        });
        // Keep parity with OG UX where users can keep starring in starboard channel.
        await sent.react('⭐').catch((error) => {
            console.debug('Could not add star reaction to starboard post:', error);
        });

        if (process.env.ENABLE_LOGGING?.toLowerCase() === 'true') {
            console.log(
                `[Starboard] Added message ${message.id} in guild ${message.guild.id} by ${client.user?.tag}`
            );
        }
    }
}
