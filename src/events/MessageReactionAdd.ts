import {
    ButtonBuilder,
    ButtonStyle,
    ContainerBuilder,
    Events,
    MediaGalleryBuilder,
    type Message,
    MessageFlags,
    SectionBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    ThumbnailBuilder,
} from 'discord.js';
import type { ArgsOf } from 'discordx';
import { Discord, On } from 'discordx';
import {
    findStarboardEntry,
    getEffectiveStarCount,
    getStarboardChannel,
    isImageAttachment,
    isStarEmoji,
    parseStarMessageMeta,
    resolveMessage,
    resolveReaction,
    updateStarMetaComponents,
} from './Starboard.shared.js';

@Discord()
export class MessageReactionAdd {
    private buildQuotedContent(content: string): string {
        return content
            .trim()
            .slice(0, 1024)
            .split('\n')
            .map((line) => `> ${line || ' '}`)
            .join('\n');
    }

    private getPreferredImageUrl(
        message: Awaited<ReturnType<typeof resolveMessage>>
    ): string | null {
        if (!message) {
            return null;
        }

        const imageAttachment = message.attachments.find((attachment) =>
            isImageAttachment(attachment)
        );
        if (imageAttachment?.url) {
            return imageAttachment.url;
        }

        const embedImage = message.embeds.find((embed) => embed.image?.url || embed.thumbnail?.url);
        return embedImage?.image?.url ?? embedImage?.thumbnail?.url ?? null;
    }

    private async updateStarboardMessage(
        message: Message,
        starCount: number,
        sourceMessageId: string
    ): Promise<void> {
        const updatedComponents = updateStarMetaComponents(message, starCount, sourceMessageId);
        await message.edit({
            components: updatedComponents,
            flags: MessageFlags.IsComponentsV2,
        });
    }

    private buildStarboardContainer(
        authorTag: string,
        authorAvatar: string,
        content: string,
        messageUrl: string,
        starCount: number,
        imageUrl: string | null
    ): ContainerBuilder {
        const hasText = content.trim().length > 0;
        const quotedContent = this.buildQuotedContent(content);

        const container = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('# ⭐ Starboard'))
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**Author:** ${authorTag}`)
            );

        if (hasText) {
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent(quotedContent))
                    .setThumbnailAccessory(new ThumbnailBuilder().setURL(authorAvatar))
            );
        } else if (imageUrl) {
            container.addSectionComponents(
                new SectionBuilder()
                    .addTextDisplayComponents(new TextDisplayBuilder().setContent('\u200B'))
                    .setThumbnailAccessory(new ThumbnailBuilder().setURL(authorAvatar))
            );
        }

        if (imageUrl) {
            container.addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small));
            container.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems((item) => item.setURL(imageUrl))
            );
        }

        container.addActionRowComponents((row) =>
            row.addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Secondary)
                    .setCustomId('starboard-count')
                    .setLabel(`⭐ ${starCount}`)
                    .setDisabled(true),
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setURL(messageUrl)
                    .setLabel('Jump to Message')
                    .setEmoji('🔗')
            )
        );

        return container;
    }

    @On({ event: Events.MessageReactionAdd })
    async onReactionAdd([reaction, user]: ArgsOf<'messageReactionAdd'>) {
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

        // Allow self-stars to remain but don't count them toward starboard.
        const effectiveCount = await getEffectiveStarCount(message, user.id);
        if (effectiveCount < 1) {
            return;
        }

        // If the reaction happened on a starboard message, only update its footer count.
        if (isStarboardMessage) {
            const parsed = parseStarMessageMeta(message);
            if (!parsed) {
                return;
            }

            await this.updateStarboardMessage(message, effectiveCount, parsed.sourceMessageId);
            return;
        }

        const existingStarboardMessage = await findStarboardEntry(starChannel, message.id);
        if (existingStarboardMessage) {
            await this.updateStarboardMessage(existingStarboardMessage, effectiveCount, message.id);
            return;
        }

        const imageUrl = this.getPreferredImageUrl(message);

        const container = this.buildStarboardContainer(
            `${message.author}`,
            message.author.displayAvatarURL({ extension: 'png' }),
            message.content ?? '',
            message.url,
            effectiveCount,
            imageUrl
        );

        const sent = await starChannel.send({
            components: [container],
            flags: MessageFlags.IsComponentsV2,
            allowedMentions: { parse: [] },
        });
        await sent.react('⭐').catch((error) => {
            console.debug('Could not add star reaction to starboard post:', error);
        });
    }
}
