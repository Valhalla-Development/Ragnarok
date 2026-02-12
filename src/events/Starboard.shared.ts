import {
    type APIMessageTopLevelComponent,
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
const STAR_INLINE_REGEX = /⭐\s(\d+)\s\|\s(\d{17,20})/;
const STAR_META_REGEX = /⭐\s\d+\s\|\s\d{17,20}/;

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

export async function getCurrentStarCount(message: Message): Promise<number> {
    const refreshed = await message.fetch().catch(() => message);
    const starReaction = refreshed.reactions.cache.find((reaction) => reaction.emoji.name === '⭐');
    return Math.max(0, starReaction?.count ?? 0);
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

export function parseStarMessageMeta(
    message: Message
): { stars: number; sourceMessageId: string } | null {
    const embedFooter = message.embeds[0]?.footer?.text;
    const parsedEmbed = parseStarFooter(embedFooter);
    if (parsedEmbed) {
        return parsedEmbed;
    }

    const collectText = (node: unknown): string[] => {
        if (Array.isArray(node)) {
            return node.flatMap(collectText);
        }
        if (!node || typeof node !== 'object') {
            return [];
        }

        const jsonNode =
            'toJSON' in node && typeof (node as { toJSON?: () => unknown }).toJSON === 'function'
                ? (node as { toJSON: () => unknown }).toJSON()
                : node;
        if (!jsonNode || typeof jsonNode !== 'object') {
            return [];
        }

        const typed = jsonNode as { content?: unknown; components?: unknown[] };
        const current = typeof typed.content === 'string' ? [typed.content] : [];
        return [...current, ...(typed.components ? collectText(typed.components) : [])];
    };

    const componentText = collectText(message.components as unknown[]).join('\n');

    const inlineMatch = STAR_INLINE_REGEX.exec(componentText);
    if (!inlineMatch) {
        return null;
    }
    return { stars: Number(inlineMatch[1] ?? 0), sourceMessageId: inlineMatch[2] ?? '' };
}

export function updateStarMetaComponents(
    sourceMessage: { components: readonly unknown[] },
    starCount: number,
    sourceMessageId: string
): APIMessageTopLevelComponent[] {
    const nextMeta = `⭐ ${starCount} | ${sourceMessageId}`;
    const replaceNode = (node: unknown): unknown => {
        if (Array.isArray(node)) {
            return node.map(replaceNode);
        }
        if (!node || typeof node !== 'object') {
            return node;
        }

        const jsonNode =
            'toJSON' in node && typeof (node as { toJSON?: () => unknown }).toJSON === 'function'
                ? (node as { toJSON: () => unknown }).toJSON()
                : node;
        if (!jsonNode || typeof jsonNode !== 'object') {
            return jsonNode;
        }

        const input = jsonNode as Record<string, unknown>;
        const output: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(input)) {
            if (key === 'content' && typeof value === 'string' && STAR_META_REGEX.test(value)) {
                output[key] = value.replace(STAR_META_REGEX, nextMeta);
                continue;
            }
            output[key] = replaceNode(value);
        }
        return output;
    };

    const updated = replaceNode(sourceMessage.components);
    if (!Array.isArray(updated)) {
        return [];
    }
    return updated.filter((item): item is APIMessageTopLevelComponent => Boolean(item));
}

export async function findStarboardEntry(
    starChannel: GuildTextBasedChannel,
    sourceMessageId: string
): Promise<Message | null> {
    const fetched = await starChannel.messages.fetch({ limit: 100 });
    const found = fetched.find((m) => {
        const parsed = parseStarMessageMeta(m);
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
