import {
    type APIMessageTopLevelComponent,
    ChannelType,
    type GuildTextBasedChannel,
    type Message,
    type MessageReaction,
    type PartialMessage,
    type PartialMessageReaction,
} from 'discord.js';
import StarBoard from '../mongo/StarBoard.js';

type AnyReaction = MessageReaction | PartialMessageReaction;
interface StarMeta {
    stars: number;
    sourceMessageId: string;
}

interface CollectedComponentData {
    texts: string[];
    labels: string[];
    urls: string[];
}

const STAR_FOOTER_REGEX = /^⭐\s(\d+)\s\|\s(\d{17,20})$/;
const STAR_INLINE_REGEX = /⭐\s(\d+)\s\|\s(\d{17,20})/;
const STAR_META_REGEX = /⭐\s\d+\s\|\s\d{17,20}/;
const STAR_COUNT_LABEL_REGEX = /⭐\s\d+/;
const STAR_COUNT_VALUE_REGEX = /⭐\s(\d+)/;
const DISCORD_MSG_URL_REGEX = /discord\.com\/channels\/\d+\/\d+\/(\d{17,20})/;
const BUTTON_COMPONENT_TYPE = 2;
const LINK_BUTTON_STYLE = 5;

function toJsonNode(node: unknown): unknown {
    if (!node || typeof node !== 'object') {
        return node;
    }

    if ('toJSON' in node && typeof (node as { toJSON?: () => unknown }).toJSON === 'function') {
        return (node as { toJSON: () => unknown }).toJSON();
    }

    return node;
}

function collectComponentData(components: readonly unknown[]): CollectedComponentData {
    const data: CollectedComponentData = { texts: [], labels: [], urls: [] };

    const walk = (node: unknown): void => {
        if (Array.isArray(node)) {
            node.forEach(walk);
            return;
        }

        const jsonNode = toJsonNode(node);
        if (!jsonNode || typeof jsonNode !== 'object') {
            return;
        }

        const obj = jsonNode as Record<string, unknown>;
        if (typeof obj.content === 'string') {
            data.texts.push(obj.content);
        }

        if (obj.type === BUTTON_COMPONENT_TYPE) {
            if (typeof obj.label === 'string') {
                data.labels.push(obj.label);
            }
            if (typeof obj.url === 'string') {
                data.urls.push(obj.url);
            }
        }

        if (Array.isArray(obj.components)) {
            obj.components.forEach(walk);
        }
    };

    walk(components);
    return data;
}

function parseStarsFromLabel(label: string): number {
    const match = STAR_COUNT_VALUE_REGEX.exec(label);
    return Number(match?.[1] ?? 0);
}

function parseSourceMessageIdFromUrl(url: string): string {
    const match = DISCORD_MSG_URL_REGEX.exec(url);
    return match?.[1] ?? '';
}

export function isStarEmoji(reaction: AnyReaction): boolean {
    return reaction.emoji.name === '⭐';
}

export function isImageAttachment(attachment: {
    url?: string;
    contentType?: string | null;
}): boolean {
    if (attachment.contentType?.startsWith('image/')) {
        return true;
    }
    const url = attachment.url ?? '';
    return /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url);
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

/**
 * Returns star count excluding self-stars
 */
export async function getEffectiveStarCount(message: Message, reactorId: string): Promise<number> {
    const total = await getCurrentStarCount(message);
    const authorId = message.author?.id;
    if (!authorId || authorId !== reactorId) {
        return total;
    }
    return Math.max(0, total - 1);
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

    if (!channel) {
        await StarBoard.deleteOne({ GuildId: guild.id });
        return null;
    }

    if (
        channel.type !== ChannelType.GuildText &&
        channel.type !== ChannelType.PublicThread &&
        channel.type !== ChannelType.PrivateThread &&
        channel.type !== ChannelType.AnnouncementThread
    ) {
        await StarBoard.deleteOne({ GuildId: guild.id });
        return null;
    }

    if (!channel.permissionsFor(guild.members.me!).has('SendMessages')) {
        return null;
    }

    return channel;
}

export function parseStarFooter(text?: string | null): StarMeta | null {
    if (!text) {
        return null;
    }
    const match = STAR_FOOTER_REGEX.exec(text.trim());
    if (!match) {
        return null;
    }
    return { stars: Number(match[1] ?? 0), sourceMessageId: match[2] ?? '' };
}

export function parseStarMessageMeta(message: Message): StarMeta | null {
    const embedFooter = message.embeds[0]?.footer?.text;
    const parsedEmbed = parseStarFooter(embedFooter);
    if (parsedEmbed) {
        return parsedEmbed;
    }

    const data = collectComponentData(message.components as unknown[]);

    const inlineMatch = STAR_INLINE_REGEX.exec(data.texts.join('\n'));
    if (inlineMatch) {
        return { stars: Number(inlineMatch[1]), sourceMessageId: inlineMatch[2] ?? '' };
    }

    const starLabel = data.labels.find((l) => /⭐\s\d+/.test(l));
    const stars = starLabel ? parseStarsFromLabel(starLabel) : 0;
    const jumpUrl = data.urls.find((u) => DISCORD_MSG_URL_REGEX.test(u));
    const sourceMessageId = jumpUrl ? parseSourceMessageIdFromUrl(jumpUrl) : '';
    if (stars > 0 && sourceMessageId) {
        return { stars, sourceMessageId };
    }
    return null;
}

export function updateStarMetaComponents(
    sourceMessage: { components: readonly unknown[] },
    starCount: number,
    sourceMessageId: string
): APIMessageTopLevelComponent[] {
    const nextMeta = `⭐ ${starCount} | ${sourceMessageId}`;
    const nextLabel = `⭐ ${starCount}`;
    const replaceNode = (node: unknown): unknown => {
        if (Array.isArray(node)) {
            return node.map(replaceNode);
        }
        if (!node || typeof node !== 'object') {
            return node;
        }

        const jsonNode = toJsonNode(node);
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
            if (
                key === 'label' &&
                typeof value === 'string' &&
                STAR_COUNT_LABEL_REGEX.test(value) &&
                input.style !== LINK_BUTTON_STYLE
            ) {
                output[key] = value.replace(STAR_COUNT_LABEL_REGEX, nextLabel);
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
