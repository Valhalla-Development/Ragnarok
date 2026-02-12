import {
    ContainerBuilder,
    Events,
    MediaGalleryBuilder,
    MessageFlags,
    SectionBuilder,
    SeparatorSpacingSize,
    TextDisplayBuilder,
    ThumbnailBuilder,
} from 'discord.js';
import type { ArgsOf } from 'discordx';
import { Discord, On } from 'discordx';
import moment from 'moment';
import {
    findStarboardEntry,
    getCurrentStarCount,
    getStarboardChannel,
    isImageAttachment,
    isStarEmoji,
    parseStarMessageMeta,
    removeSelfStar,
    resolveMessage,
    resolveReaction,
    updateStarMetaComponents,
} from './Starboard.shared.js';

@Discord()
export class MessageReactionAdd {
    private logStarboard(
        action: string,
        guildId: string,
        sourceMessageId: string,
        stars: number
    ): void {
        if (process.env.ENABLE_LOGGING?.toLowerCase() !== 'true') {
            return;
        }

        console.log(
            `${'◆◆◆◆◆◆'.rainbow.bold} ${moment().format('MMM D, h:mm A')} ${'◆◆◆◆◆◆'.rainbow.bold}\n` +
                `${'⭐ Starboard:'.brightBlue.bold} ${action.brightYellow.bold}\n` +
                `${'🧾 Source:'.brightBlue.bold} ${sourceMessageId.brightMagenta.bold} ${'|'.gray.bold} ${'🌟 Stars:'.brightBlue.bold} ${String(stars).brightYellow.bold} ${'|'.gray.bold} ${'🏠 Guild:'.brightBlue.bold} ${guildId.brightMagenta.bold}`
        );
    }

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
        const summaryLines = [
            `**Channel:** <#${channelId}>`,
            `**Message:** ${content.trim() ? content.substring(0, 1024) : 'N/A'}`,
            `**Jump:** [Jump To Message](${messageUrl})`,
        ];

        const summarySection = new SectionBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent(summaryLines.join('\n')))
            .setThumbnailAccessory(new ThumbnailBuilder().setURL(authorAvatar));

        const container = new ContainerBuilder()
            .addTextDisplayComponents(new TextDisplayBuilder().setContent('# Starboard'))
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`**Author:** ${authorTag}`)
            )
            .addSectionComponents(summarySection);

        if (imageUrl) {
            container.addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small));
            container.addMediaGalleryComponents(
                new MediaGalleryBuilder().addItems((item) => item.setURL(imageUrl))
            );
        }

        container
            .addSeparatorComponents((s) => s.setSpacing(SeparatorSpacingSize.Small))
            .addTextDisplayComponents(
                new TextDisplayBuilder().setContent(`⭐ ${starCount} | ${sourceMessageId}`)
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

        // Prevent users starring their own messages (OG behavior).
        await removeSelfStar(resolvedReaction, user);
        const safeStarCount = await getCurrentStarCount(message);
        if (safeStarCount < 1) {
            return;
        }

        // If the reaction happened on a starboard message, only update its footer count.
        if (isStarboardMessage) {
            const parsed = parseStarMessageMeta(message);
            if (!parsed) {
                return;
            }

            const updatedComponents = updateStarMetaComponents(
                message,
                safeStarCount,
                parsed.sourceMessageId
            );
            await message.edit({
                components: updatedComponents,
                flags: MessageFlags.IsComponentsV2,
            });
            this.logStarboard(
                'Updated Starboard Post Count',
                message.guild.id,
                parsed.sourceMessageId,
                safeStarCount
            );
            return;
        }

        const existingStarboardMessage = await findStarboardEntry(starChannel, message.id);
        if (existingStarboardMessage) {
            const updatedComponents = updateStarMetaComponents(
                existingStarboardMessage,
                safeStarCount,
                message.id
            );
            await existingStarboardMessage.edit({
                components: updatedComponents,
                flags: MessageFlags.IsComponentsV2,
            });
            this.logStarboard(
                'Updated Linked Star Count',
                message.guild.id,
                message.id,
                safeStarCount
            );
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
        this.logStarboard('Created Starboard Post', message.guild.id, message.id, safeStarCount);
    }
}
