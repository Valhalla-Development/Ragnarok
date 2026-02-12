import { type APIMessageTopLevelComponent, Events, MessageFlags } from 'discord.js';
import type { ArgsOf } from 'discordx';
import { Discord, On } from 'discordx';
import {
    findStarboardEntry,
    getStarboardChannel,
    isStarEmoji,
    parseStarMessageMeta,
    resolveMessage,
    resolveReaction,
} from './Starboard.shared.js';

@Discord()
export class MessageReactionRemove {
    private static readonly STAR_META_REGEX = /⭐\s\d+\s\|\s\d{17,20}/;

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
                        !MessageReactionRemove.STAR_META_REGEX.test(componentData.content)
                    ) {
                        return componentData;
                    }
                    return {
                        ...componentData,
                        content: componentData.content.replace(
                            MessageReactionRemove.STAR_META_REGEX,
                            nextMeta
                        ),
                    };
                }),
            } as APIMessageTopLevelComponent;
        });
        return rows.filter((row): row is APIMessageTopLevelComponent => row !== null);
    }

    @On({ event: Events.MessageReactionRemove })
    async onReactionRemove([reaction, user]: ArgsOf<'messageReactionRemove'>) {
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

        const starCount = Math.max(0, resolvedReaction.count ?? 0);

        // If a star was removed from a starboard message, update or delete that starboard message.
        if (message.channelId === starChannel.id) {
            const parsed = parseStarMessageMeta(message);
            if (!parsed) {
                return;
            }

            if (starCount <= 0) {
                await message.delete().catch((error) => {
                    console.debug('Could not delete starboard message after 0 stars:', error);
                });
                return;
            }

            const updatedComponents = this.getUpdatedComponents(
                message,
                starCount,
                parsed.sourceMessageId
            );
            await message.edit({
                components: updatedComponents,
                flags: MessageFlags.IsComponentsV2,
            });
            return;
        }

        const existingStarboardMessage = await findStarboardEntry(starChannel, message.id);
        if (!existingStarboardMessage) {
            return;
        }

        if (starCount <= 0) {
            await existingStarboardMessage.delete().catch((error) => {
                console.debug('Could not delete linked starboard message after 0 stars:', error);
            });
            return;
        }

        const updatedComponents = this.getUpdatedComponents(
            existingStarboardMessage,
            starCount,
            message.id
        );
        await existingStarboardMessage.edit({
            components: updatedComponents,
            flags: MessageFlags.IsComponentsV2,
        });
    }
}
