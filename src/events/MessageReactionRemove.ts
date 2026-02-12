import { Events, MessageFlags } from 'discord.js';
import type { ArgsOf } from 'discordx';
import { Discord, On } from 'discordx';
import {
    findStarboardEntry,
    getCurrentStarCount,
    getStarboardChannel,
    isStarEmoji,
    parseStarMessageMeta,
    resolveMessage,
    resolveReaction,
    updateStarMetaComponents,
} from './Starboard.shared.js';

@Discord()
export class MessageReactionRemove {
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
        if (!message?.guild) {
            return;
        }

        const starChannel = await getStarboardChannel(message);
        if (!starChannel) {
            return;
        }
        const isStarboardMessage = message.channelId === starChannel.id;
        if (message.author?.bot && !isStarboardMessage) {
            return;
        }

        const starCount = await getCurrentStarCount(message);

        // If a star was removed from a starboard message, update or delete that starboard message.
        if (isStarboardMessage) {
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

            const updatedComponents = updateStarMetaComponents(
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

        const updatedComponents = updateStarMetaComponents(
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
