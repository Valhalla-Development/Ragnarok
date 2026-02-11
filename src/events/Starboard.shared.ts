import {
    ChannelType,
    type GuildTextBasedChannel,
    type Message,
    type MessageReaction,
    type PartialMessage,
    type PartialMessageReaction,
    type PartialUser,
    type User,
} from 'discord.js';
import StarBoard from '../mongo/StarBoard.js';

type AnyReaction = MessageReaction | PartialMessageReaction;

const STAR_FOOTER_REGEX = /^⭐\s(\d+)\s\|\s(\d{17,20})$/;

export function isStarEmoji(reaction: AnyReaction): boolean {
    return reaction.emoji.name === '⭐';
}

export function isImageAttachment(url: string): boolean {
    return /\.(png|jpe?g|gif|webp)$/i.test(url);
}

export async function resolveReaction(reaction: AnyReaction): Promise<MessageReaction | null> {
    let resolved = reaction;
    if (resolved.partial) {
        try {
            resolved = await resolved.fetch();
        } catch {
            return null;
        }
    }
    return resolved as MessageReaction;
}

export async function resolveMessage(message: Message | PartialMessage): Promise<Message | null> {
    let resolved = message;
    if (resolved.partial) {
        try {
            resolved = await resolved.fetch();
        } catch {
            return null;
        }
    }
    return resolved;
}

export async function getStarboardChannel(message: Message): Promise<GuildTextBasedChannel | null> {
    const guild = message.guild;
    if (!guild) {
        return null;
    }

    const config = await StarBoard.findOne({ GuildId: guild.id });
    if (!config?.ChannelId) {
        return null;
    }

    const channel =
        guild.channels.cache.get(config.ChannelId) ??
        (await guild.channels.fetch(config.ChannelId));

    if (
        !channel ||
        (channel.type !== ChannelType.GuildText &&
            channel.type !== ChannelType.PublicThread &&
            channel.type !== ChannelType.PrivateThread &&
            channel.type !== ChannelType.AnnouncementThread)
    ) {
        await StarBoard.deleteOne({ GuildId: guild.id });
        return null;
    }

    if (!channel.permissionsFor(guild.members.me!).has('SendMessages')) {
        return null;
    }

    return channel;
}

export function parseStarFooter(
    text?: string | null
): { stars: number; sourceMessageId: string } | null {
    if (!text) {
        return null;
    }
    const match = STAR_FOOTER_REGEX.exec(text.trim());
    if (!match) {
        return null;
    }
    return { stars: Number(match[1] ?? 0), sourceMessageId: match[2] ?? '' };
}

export async function findStarboardEntry(
    starChannel: GuildTextBasedChannel,
    sourceMessageId: string
): Promise<Message | null> {
    const fetched = await starChannel.messages.fetch({ limit: 100 });
    const found = fetched.find((m) => {
        const embed = m.embeds[0];
        const parsed = parseStarFooter(embed?.footer?.text);
        return parsed?.sourceMessageId === sourceMessageId;
    });

    return found ?? null;
}

export async function removeSelfStar(
    reaction: MessageReaction,
    user: User | PartialUser
): Promise<void> {
    const authorId = reaction.message.author?.id;
    if (!authorId || authorId !== user.id) {
        return;
    }
    try {
        await reaction.users.remove(user.id);
    } catch {
        // Ignore missing permission/race conditions.
    }
}
