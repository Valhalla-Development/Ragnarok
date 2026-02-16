import { config } from '../../config/Config.js';
import AIHistory from '../../mongo/AIHistory.js';
import AIUser from '../../mongo/AIUser.js';
import { aiClient, getResetTimeMs, isAIAdmin } from './Client.js';
import type { AIAvailabilityResult, AIUserData } from './Types.js';

const AI_BLACKLIST_MESSAGE =
    'You are currently blacklisted from AI usage. If this is a mistake, contact a moderator.';

interface AIUserDoc {
    TotalQueries?: number;
    QueriesRemaining?: number;
    Expiration?: number;
    Whitelisted?: boolean;
    Blacklisted?: boolean;
}

function toAIUserData(data: AIUserDoc | null): AIUserData | null {
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
    return toAIUserData(data);
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

function calculateExpiration(current: number, next: number): number {
    return current > 1 ? current : next;
}

function resolveNonAdminAvailability(
    previous: AIUserData | null,
    maxLimit: number,
    now: number,
    nextExpiration: number
): AIAvailabilityResult {
    if (!previous) {
        return {
            ok: true,
            data: {
                totalQueries: 1,
                queriesRemaining: maxLimit - 1,
                expiration: nextExpiration,
                whitelisted: false,
                blacklisted: false,
            },
        };
    }

    if (previous.blacklisted) {
        return { ok: false, message: AI_BLACKLIST_MESSAGE };
    }

    if (previous.whitelisted) {
        return {
            ok: true,
            data: {
                ...previous,
                totalQueries: previous.totalQueries + 1,
                queriesRemaining: maxLimit,
                expiration: 1,
            },
        };
    }

    if (previous.queriesRemaining > 0) {
        return {
            ok: true,
            data: {
                ...previous,
                totalQueries: previous.totalQueries + 1,
                queriesRemaining: previous.queriesRemaining - 1,
                expiration: calculateExpiration(previous.expiration, nextExpiration),
            },
        };
    }

    if (now > previous.expiration) {
        return {
            ok: true,
            data: {
                ...previous,
                totalQueries: previous.totalQueries + 1,
                queriesRemaining: maxLimit - 1,
                expiration: nextExpiration,
            },
        };
    }

    return {
        ok: false,
        message: `You've reached your AI query limit. It resets <t:${Math.floor(
            previous.expiration / 1000
        )}:R>.`,
    };
}

export async function checkAIAvailability(userId: string): Promise<AIAvailabilityResult> {
    const maxLimit = Math.max(1, Number(config.MAX_AI_QUERIES_LIMIT || 30));
    const resetTimeMs = getResetTimeMs();
    const now = Date.now();
    const nextExpiration = now + resetTimeMs;

    if (isAIAdmin(userId)) {
        const adminUpdated = await AIUser.findOneAndUpdate(
            { UserId: userId },
            {
                $inc: { TotalQueries: 1 },
                $set: {
                    QueriesRemaining: maxLimit,
                    Expiration: 1,
                },
                $setOnInsert: {
                    UserId: userId,
                    Whitelisted: false,
                    Blacklisted: false,
                },
            },
            { returnDocument: 'after', upsert: true, lean: true }
        ).exec();

        const adminData = toAIUserData(adminUpdated);
        if (adminData) {
            return { ok: true, data: adminData };
        }
    }

    const previousDoc = await AIUser.findOneAndUpdate(
        { UserId: userId },
        [
            {
                $set: {
                    UserId: { $ifNull: ['$UserId', userId] },
                    TotalQueries: { $ifNull: ['$TotalQueries', 0] },
                    QueriesRemaining: { $ifNull: ['$QueriesRemaining', 0] },
                    Expiration: { $ifNull: ['$Expiration', 0] },
                    Whitelisted: { $ifNull: ['$Whitelisted', false] },
                    Blacklisted: { $ifNull: ['$Blacklisted', false] },
                },
            },
            {
                $set: {
                    _canUseWhitelist: {
                        $and: [{ $eq: ['$Blacklisted', false] }, { $eq: ['$Whitelisted', true] }],
                    },
                    _canUseNormal: {
                        $and: [
                            { $eq: ['$Blacklisted', false] },
                            { $eq: ['$Whitelisted', false] },
                            { $gt: ['$QueriesRemaining', 0] },
                        ],
                    },
                    _canUseReset: {
                        $and: [
                            { $eq: ['$Blacklisted', false] },
                            { $eq: ['$Whitelisted', false] },
                            { $lte: ['$QueriesRemaining', 0] },
                            { $lt: ['$Expiration', now] },
                        ],
                    },
                },
            },
            {
                $set: {
                    TotalQueries: {
                        $cond: [
                            { $or: ['$_canUseWhitelist', '$_canUseNormal', '$_canUseReset'] },
                            { $add: ['$TotalQueries', 1] },
                            '$TotalQueries',
                        ],
                    },
                    QueriesRemaining: {
                        $cond: [
                            '$_canUseWhitelist',
                            maxLimit,
                            {
                                $cond: [
                                    '$_canUseNormal',
                                    { $subtract: ['$QueriesRemaining', 1] },
                                    {
                                        $cond: ['$_canUseReset', maxLimit - 1, '$QueriesRemaining'],
                                    },
                                ],
                            },
                        ],
                    },
                    Expiration: {
                        $cond: [
                            '$_canUseWhitelist',
                            1,
                            {
                                $cond: [
                                    '$_canUseNormal',
                                    {
                                        $cond: [
                                            { $gt: ['$Expiration', 1] },
                                            '$Expiration',
                                            nextExpiration,
                                        ],
                                    },
                                    { $cond: ['$_canUseReset', nextExpiration, '$Expiration'] },
                                ],
                            },
                        ],
                    },
                },
            },
            { $unset: ['_canUseWhitelist', '_canUseNormal', '_canUseReset'] },
        ],
        {
            upsert: true,
            // keeping this false on purpose so I can read the old state and
            // decide the exact allow/deny message without another query.
            returnDocument: 'before',
            lean: true,
        }
    ).exec();

    return resolveNonAdminAvailability(toAIUserData(previousDoc), maxLimit, now, nextExpiration);
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
