import { config } from '../../config/Config.js';
import AIHistory from '../../mongo/AIHistory.js';
import AIUser from '../../mongo/AIUser.js';
import { aiClient, getResetTimeMs, isAIAdmin } from './client.js';
import type { AIAvailabilityResult, AIUserData } from './types.js';

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
