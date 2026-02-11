import { EmbedBuilder, Events } from 'discord.js';
import type { ArgsOf } from 'discordx';
import { Discord, On } from 'discordx';
import {
    findStarboardEntry,
    getStarboardChannel,
    isStarEmoji,
    parseStarFooter,
    resolveMessage,
    resolveReaction,
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
            const existingEmbed = message.embeds[0];
            const parsed = parseStarFooter(existingEmbed?.footer?.text);
            if (!existingEmbed || parsed === null) {
                return;
            }

            if (starCount <= 0) {
                await message.delete().catch((error) => {
                    console.debug('Could not delete starboard message after 0 stars:', error);
                });
                return;
            }

            const updated = EmbedBuilder.from(existingEmbed).setFooter({
                text: `⭐ ${starCount} | ${parsed.sourceMessageId}`,
            });
            await message.edit({ embeds: [updated] });
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

        const existingEmbed = existingStarboardMessage.embeds[0];
        if (!existingEmbed) {
            return;
        }

        const updated = EmbedBuilder.from(existingEmbed).setFooter({
            text: `⭐ ${starCount} | ${message.id}`,
        });
        await existingStarboardMessage.edit({ embeds: [updated] });
    }
}
