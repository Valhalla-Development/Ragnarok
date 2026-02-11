import { EmbedBuilder, Events } from 'discord.js';
import type { ArgsOf, Client } from 'discordx';
import { Discord, On } from 'discordx';
import { color } from '../utils/Util.js';
import {
    findStarboardEntry,
    getStarboardChannel,
    isImageAttachment,
    isStarEmoji,
    parseStarFooter,
    removeSelfStar,
    resolveMessage,
    resolveReaction,
} from './Starboard.shared.js';

@Discord()
export class MessageReactionAdd {
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
            const existingEmbed = message.embeds[0];
            const parsed = parseStarFooter(existingEmbed?.footer?.text);
            if (!existingEmbed || parsed === null) {
                return;
            }

            const updated = EmbedBuilder.from(existingEmbed).setFooter({
                text: `⭐ ${safeStarCount} | ${parsed.sourceMessageId}`,
            });
            await message.edit({ embeds: [updated] });
            return;
        }

        const existingStarboardMessage = await findStarboardEntry(starChannel, message.id);
        if (existingStarboardMessage) {
            const existingEmbed = existingStarboardMessage.embeds[0];
            if (!existingEmbed) {
                return;
            }

            const updated = EmbedBuilder.from(existingEmbed).setFooter({
                text: `⭐ ${safeStarCount} | ${message.id}`,
            });
            await existingStarboardMessage.edit({ embeds: [updated] });
            return;
        }

        const attachment = message.attachments.first();
        const imageUrl =
            attachment?.url && isImageAttachment(attachment.url) ? attachment.url : null;

        const embed = new EmbedBuilder()
            .setColor(color(message.guild.members.me?.displayHexColor ?? '#FEE75C'))
            .setThumbnail(message.author.displayAvatarURL({ extension: 'png' }))
            .addFields(
                { name: '**Author**', value: `${message.author}`, inline: true },
                { name: '**Channel**', value: `<#${message.channel.id}>`, inline: true },
                {
                    name: '**Message**',
                    value: message.content?.trim() ? message.content.substring(0, 1024) : 'N/A',
                },
                {
                    name: '**Jump**',
                    value: `[Jump To Message](${message.url})`,
                }
            )
            .setFooter({ text: `⭐ ${safeStarCount} | ${message.id}` })
            .setTimestamp();

        if (imageUrl) {
            embed.setImage(imageUrl);
        }

        const sent = await starChannel.send({ embeds: [embed] });
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
