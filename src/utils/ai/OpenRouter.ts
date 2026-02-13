import type {
    ChatCompletionResult,
    HistoryEntry,
    IHistoryStorage,
    OpenRouterClient,
} from 'openrouter-kit';
import '@colors/colors';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import moment from 'moment';
import { OpenRouterClient as OpenRouterClientCtor } from 'openrouter-kit';
import { config, durationToMs } from '../../config/Config.js';
import AIConfig from '../../mongo/AIConfig.js';
import AIHistory from '../../mongo/AIHistory.js';
import AIUser from '../../mongo/AIUser.js';

interface AIUserData {
    totalQueries: number;
    queriesRemaining: number;
    expiration: number;
    whitelisted: boolean;
    blacklisted: boolean;
}

type AIAvailabilityResult = { ok: true; data: AIUserData } | { ok: false; message: string };

type AIRunResult = { ok: true; chunks: string[] } | { ok: false; message: string };

class MongoHistoryStorage implements IHistoryStorage {
    async load(key: string): Promise<HistoryEntry[]> {
        const doc = await AIHistory.findOne({ Key: key }).lean().exec();
        if (!doc?.Entries) {
            return [];
        }
        // Filter out system messages to ensure fresh system prompt is used on every request
        const entries = doc.Entries as HistoryEntry[];
        return entries.filter((entry) => entry.message?.role !== 'system');
    }

    async save(key: string, entries: HistoryEntry[]): Promise<void> {
        await AIHistory.findOneAndUpdate(
            { Key: key },
            {
                $set: {
                    Key: key,
                    Entries: entries,
                    UpdatedAt: Date.now(),
                },
            },
            { upsert: true }
        ).exec();
    }

    async delete(key: string): Promise<void> {
        await AIHistory.deleteOne({ Key: key }).exec();
    }

    async listKeys(): Promise<string[]> {
        const docs = await AIHistory.find({}, { Key: 1, _id: 0 }).lean().exec();
        return docs.map((doc) => String(doc.Key));
    }
}

let aiClient: OpenRouterClient | null = null;
let cachedSystemPrompt: string | null = null;

function aiLogStart(userId: string, prompt: string): void {
    if (!config.ENABLE_LOGGING) {
        return;
    }

    const shortPrompt = prompt.length > 80 ? `${prompt.slice(0, 77)}...` : prompt;
    console.log(
        `${'◆◆◆◆◆◆'.rainbow.bold} ${moment().format('MMM D, h:mm A')} ${'◆◆◆◆◆◆'.rainbow.bold}\n` +
            `${'🤖 OpenRouter Query'.brightBlue.bold} ${`user:${userId}`.brightMagenta.bold}\n` +
            `${'📝 Prompt: '.brightBlue.bold}${shortPrompt.brightYellow.bold}`
    );
}

function aiLogDone(result: ChatCompletionResult, durationMs: number): void {
    if (!config.ENABLE_LOGGING) {
        return;
    }

    const totalTokens = result.usage?.total_tokens ?? 0;
    console.log(
        `${'✅ AI Complete'.brightGreen.bold} ${`(${durationMs}ms)`.gray} ` +
            `${'Model:'.brightBlue.bold} ${result.model.brightMagenta.bold} ` +
            `${'Tokens:'.brightBlue.bold} ${String(totalTokens).brightYellow.bold}`
    );
}

function getResetTimeMs(): number {
    try {
        return durationToMs(config.AI_QUERIES_RESET_TIME);
    } catch {
        return durationToMs('24h');
    }
}

function getSystemPrompt(): string {
    if (cachedSystemPrompt) {
        return cachedSystemPrompt;
    }

    const fallback =
        config.OPENROUTER_SYSTEM_PROMPT ||
        'You are a helpful Discord assistant. Keep answers concise and practical.';

    const relativePath = config.OPENROUTER_SYSTEM_PROMPT_FILE?.trim();
    if (!relativePath) {
        cachedSystemPrompt = fallback;
        return cachedSystemPrompt;
    }

    const promptPath = path.isAbsolute(relativePath)
        ? relativePath
        : path.join(process.cwd(), relativePath);

    try {
        const filePrompt = readFileSync(promptPath, 'utf-8').trim();
        cachedSystemPrompt = filePrompt.length > 0 ? filePrompt : fallback;
    } catch (error) {
        if (config.ENABLE_LOGGING) {
            console.warn(`Could not read AI prompt file at ${promptPath}:`, error);
        }
        cachedSystemPrompt = fallback;
    }

    return cachedSystemPrompt;
}

export function isAIEnabled(): boolean {
    return config.OPENROUTER_API_KEY.trim().length > 0;
}

export async function isAIChannelAllowed(
    guildId: string | null | undefined,
    channelId: string | null | undefined
): Promise<boolean> {
    if (!(guildId && channelId)) {
        return true;
    }

    const cfg = await AIConfig.findOne({ GuildId: guildId }).lean().exec();
    if (cfg?.Enabled === false) {
        return false;
    }
    const allowed = cfg?.AllowedChannelIds ?? [];
    if (allowed.length === 0) {
        return true;
    }
    return allowed.includes(channelId);
}

export async function getAIAllowedChannels(guildId: string): Promise<string[]> {
    const cfg = await AIConfig.findOne({ GuildId: guildId }).lean().exec();
    return (cfg?.AllowedChannelIds ?? []).map((id) => String(id));
}

export async function isAIGuildEnabled(guildId: string): Promise<boolean> {
    const cfg = await AIConfig.findOne({ GuildId: guildId }).lean().exec();
    return cfg?.Enabled !== false;
}

export async function setAIGuildEnabled(guildId: string, enabled: boolean): Promise<boolean> {
    await AIConfig.findOneAndUpdate(
        { GuildId: guildId },
        { $set: { GuildId: guildId, Enabled: enabled } },
        { upsert: true }
    ).exec();
    return enabled;
}

export async function toggleAIAllowedChannel(
    guildId: string,
    channelId: string
): Promise<string[]> {
    const current = await getAIAllowedChannels(guildId);
    const set = new Set(current);
    if (set.has(channelId)) {
        set.delete(channelId);
    } else {
        set.add(channelId);
    }
    const next = Array.from(set);
    await AIConfig.findOneAndUpdate(
        { GuildId: guildId },
        { $set: { GuildId: guildId, AllowedChannelIds: next } },
        { upsert: true }
    ).exec();
    return next;
}

export async function clearAIAllowedChannels(guildId: string): Promise<void> {
    await AIConfig.findOneAndUpdate(
        { GuildId: guildId },
        { $set: { GuildId: guildId, AllowedChannelIds: [] } },
        { upsert: true }
    ).exec();
}

export async function setAIAllowedChannels(
    guildId: string,
    channelIds: string[]
): Promise<string[]> {
    const unique = Array.from(new Set(channelIds)).slice(0, 25);
    await AIConfig.findOneAndUpdate(
        { GuildId: guildId },
        { $set: { GuildId: guildId, AllowedChannelIds: unique } },
        { upsert: true }
    ).exec();
    return unique;
}

export async function getAITopUsers(
    limit = 10
): Promise<Array<{ userId: string; totalQueries: number }>> {
    const docs = await AIUser.find(
        {},
        {
            UserId: 1,
            TotalQueries: 1,
            _id: 0,
        }
    )
        .sort({ TotalQueries: -1 })
        .limit(limit)
        .lean()
        .exec();

    return docs.map((doc) => ({
        userId: String(doc.UserId),
        totalQueries: Number(doc.TotalQueries ?? 0),
    }));
}

export async function getAITotalQueryCount(): Promise<number> {
    const rows = await AIUser.aggregate<{ total: number }>([
        { $group: { _id: null, total: { $sum: '$TotalQueries' } } },
    ]).exec();
    return Number(rows[0]?.total ?? 0);
}

function getClient(): OpenRouterClient {
    if (aiClient) {
        return aiClient;
    }

    aiClient = new OpenRouterClientCtor({
        apiKey: config.OPENROUTER_API_KEY,
        model: config.OPENROUTER_MODEL,
        historyAdapter: new MongoHistoryStorage(),
        enableCostTracking: false,
        // Keep library internals quiet; we print concise custom logs.
        debug: false,
    });

    return aiClient;
}

function splitMessages(content: string, length = 1900): string[] {
    if (content.length <= length) {
        return [content];
    }

    const chunks: string[] = [];
    let remainingContent = content.trim();

    while (remainingContent.length > 0) {
        const chunkEnd =
            remainingContent.length <= length
                ? remainingContent.length
                : remainingContent.lastIndexOf(' ', length) ||
                  remainingContent.indexOf(' ', length);

        chunks.push(remainingContent.slice(0, chunkEnd).trim());
        remainingContent = remainingContent.slice(chunkEnd).trim();
    }

    const totalChunks = chunks.length;
    return chunks.map((chunk, index) => `${chunk}\n\`${index + 1}\`/\`${totalChunks}\``);
}

function normalizeResponseContent(content: unknown): string {
    if (typeof content === 'string') {
        return content.trim();
    }

    try {
        return JSON.stringify(content, null, 2);
    } catch {
        return String(content);
    }
}

export function isAIAdmin(userId: string): boolean {
    return config.AI_ADMIN_USER_IDS.includes(userId);
}

export function isAIStaff(roleIds: string[] | undefined, userId: string): boolean {
    if (isAIAdmin(userId)) {
        return true;
    }
    if (!roleIds?.length) {
        return false;
    }
    return roleIds.some((id) => config.AI_STAFF_ROLE_IDS.includes(id));
}

export async function getAiUserData(userId: string): Promise<AIUserData | null> {
    const data = await AIUser.findOne({ UserId: userId }).lean().exec();
    if (!data) {
        return null;
    }
    return {
        totalQueries: Number(data.TotalQueries ?? 0),
        queriesRemaining: Number(data.QueriesRemaining ?? 0),
        expiration: Number(data.Expiration ?? 0),
        whitelisted: Boolean(data.Whitelisted),
        blacklisted: Boolean(data.Blacklisted),
    };
}

async function setAiUserData(userId: string, data: AIUserData): Promise<AIUserData> {
    await AIUser.findOneAndUpdate(
        { UserId: userId },
        {
            $set: {
                UserId: userId,
                TotalQueries: data.totalQueries,
                QueriesRemaining: data.queriesRemaining,
                Expiration: data.expiration,
                Whitelisted: data.whitelisted,
                Blacklisted: data.blacklisted,
            },
        },
        { upsert: true }
    ).exec();
    return data;
}

export async function checkAIAvailability(userId: string): Promise<AIAvailabilityResult> {
    const maxLimit = Math.max(1, Number(config.MAX_AI_QUERIES_LIMIT || 30));
    const resetTimeMs = getResetTimeMs();
    const now = Date.now();
    const nextExpiration = now + resetTimeMs;

    const existing = await getAiUserData(userId);

    if (isAIAdmin(userId)) {
        const next: AIUserData = {
            totalQueries: (existing?.totalQueries ?? 0) + 1,
            queriesRemaining: maxLimit,
            expiration: 1,
            whitelisted: existing?.whitelisted ?? false,
            blacklisted: existing?.blacklisted ?? false,
        };
        await setAiUserData(userId, next);
        return { ok: true, data: next };
    }

    if (!existing) {
        const newData: AIUserData = {
            totalQueries: 1,
            queriesRemaining: maxLimit - 1,
            expiration: nextExpiration,
            whitelisted: false,
            blacklisted: false,
        };
        await setAiUserData(userId, newData);
        return { ok: true, data: newData };
    }

    if (existing.blacklisted) {
        return {
            ok: false,
            message:
                'You are currently blacklisted from AI usage. If this is a mistake, contact a moderator.',
        };
    }

    if (existing.whitelisted) {
        const next: AIUserData = {
            ...existing,
            totalQueries: existing.totalQueries + 1,
            queriesRemaining: maxLimit,
            expiration: 1,
        };
        await setAiUserData(userId, next);
        return { ok: true, data: next };
    }

    if (existing.queriesRemaining <= 0) {
        if (now > existing.expiration) {
            const next: AIUserData = {
                ...existing,
                totalQueries: existing.totalQueries + 1,
                queriesRemaining: maxLimit - 1,
                expiration: nextExpiration,
            };
            await setAiUserData(userId, next);
            return { ok: true, data: next };
        }

        return {
            ok: false,
            message: `You've reached your AI query limit. It resets <t:${Math.floor(
                existing.expiration / 1000
            )}:R>.`,
        };
    }

    const next: AIUserData = {
        ...existing,
        totalQueries: existing.totalQueries + 1,
        queriesRemaining: existing.queriesRemaining - 1,
        expiration: existing.expiration > 1 ? existing.expiration : nextExpiration,
    };
    await setAiUserData(userId, next);
    return { ok: true, data: next };
}

export async function setAIBlacklist(userId: string, blacklisted: boolean): Promise<AIUserData> {
    const maxLimit = Math.max(1, Number(config.MAX_AI_QUERIES_LIMIT || 30));
    const existing = await getAiUserData(userId);

    const next: AIUserData = {
        totalQueries: existing?.totalQueries ?? 0,
        queriesRemaining: maxLimit,
        expiration: 1,
        whitelisted: false,
        blacklisted,
    };
    return setAiUserData(userId, next);
}

export async function setAIWhitelist(userId: string, whitelisted: boolean): Promise<AIUserData> {
    const maxLimit = Math.max(1, Number(config.MAX_AI_QUERIES_LIMIT || 30));
    const existing = await getAiUserData(userId);

    const next: AIUserData = {
        totalQueries: existing?.totalQueries ?? 0,
        queriesRemaining: maxLimit,
        expiration: 1,
        whitelisted,
        blacklisted: false,
    };
    return setAiUserData(userId, next);
}

export async function resetAICooldown(userId: string): Promise<AIUserData> {
    const maxLimit = Math.max(1, Number(config.MAX_AI_QUERIES_LIMIT || 30));
    const existing = await getAiUserData(userId);
    const next: AIUserData = {
        totalQueries: existing?.totalQueries ?? 0,
        queriesRemaining: maxLimit,
        expiration: 1,
        whitelisted: existing?.whitelisted ?? false,
        blacklisted: existing?.blacklisted ?? false,
    };
    return setAiUserData(userId, next);
}

export async function resetAIHistory(userId: string): Promise<void> {
    const safeUser = userId.replace(/[:/\\?#%]/g, '_');
    const suffix = `_user:${safeUser}`;
    const keyFilter = {
        $or: [{ Key: `user:${safeUser}` }, { Key: { $regex: `${suffix}$` } }],
    };

    // Capture keys first so we can also clear in-memory cache in OpenRouter Kit.
    const docs = await AIHistory.find(keyFilter, { Key: 1, _id: 0 }).lean().exec();
    const keys = Array.from(new Set([`user:${safeUser}`, ...docs.map((doc) => String(doc.Key))]));

    await AIHistory.deleteMany(keyFilter).exec();

    if (aiClient) {
        const historyManager = aiClient.getHistoryManager();
        await Promise.all(
            keys.map((key) =>
                historyManager.deleteHistory(key).catch((error) => {
                    if (config.ENABLE_LOGGING) {
                        console.warn(`Failed to clear cached AI history key '${key}':`, error);
                    }
                })
            )
        );
    }
}

export function buildAIGroupId(input: {
    guildId?: string | null;
    channelId?: string | null;
    threadId?: string | null;
    userId: string;
}): string {
    if (!input.guildId) {
        return `dm:${input.userId}`;
    }
    if (input.threadId) {
        return `guild:${input.guildId}:thread:${input.threadId}`;
    }
    return `guild:${input.guildId}:channel:${input.channelId ?? 'unknown'}`;
}

export async function runAIChat(params: {
    userId: string;
    groupId: string;
    prompt: string;
    displayName?: string;
}): Promise<AIRunResult> {
    if (!isAIEnabled()) {
        return {
            ok: false,
            message:
                'AI is not configured yet. Set `OPENROUTER_API_KEY` in your environment first.',
        };
    }

    const stripped = params.prompt.trim();
    if (stripped.length < 4) {
        return { ok: false, message: 'Please enter a query with at least 4 characters.' };
    }
    const normalizedDisplayName = params.displayName?.trim();
    const systemPrompt =
        normalizedDisplayName && normalizedDisplayName.length > 0
            ? [
                  getSystemPrompt(),
                  '',
                  `Context: The current user's name is "${normalizedDisplayName}".`,
                  'Use this naturally only when relevant.',
                  'Never mention "display name" or that this comes from metadata.',
              ].join('\n')
            : getSystemPrompt();

    const availability = await checkAIAvailability(params.userId);
    if (!availability.ok) {
        return availability;
    }

    try {
        const client = getClient();
        const start = Date.now();
        aiLogStart(params.userId, stripped);
        const result = (await client.chat({
            user: params.userId,
            group: params.groupId,
            prompt: stripped,
            systemPrompt,
        })) as ChatCompletionResult;

        const content = normalizeResponseContent(result.content);
        if (!content.length) {
            return { ok: false, message: 'The model returned an empty response. Try again.' };
        }

        aiLogDone(result, Date.now() - start);
        return { ok: true, chunks: splitMessages(content, 1900) };
    } catch (error) {
        console.error('OpenRouter chat error:', error);
        return {
            ok: false,
            message: 'An AI error occurred while processing your request. Please try again.',
        };
    }
}
