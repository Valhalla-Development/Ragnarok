import { config } from '../../config/Config.js';
import AIHistory from '../../mongo/AIHistory.js';
import AIUser from '../../mongo/AIUser.js';
import { aiClient, getResetTimeMs, isAIAdmin } from './Client.js';
import type { AIAvailabilityResult, AIUserData } from './Types.js';

const AI_BLACKLIST_MESSAGE =
    'You are currently blacklisted from AI usage. If this is a mistake, contact a moderator.';

interface AIUserDoc {
    Blacklisted?: boolean;
    Expiration?: number;
    QueriesRemaining?: number;
    TotalQueries?: number;
    Whitelisted?: boolean;
}

function toAIUserData(data: AIUserDoc | null): AIUserData | null {
    if (!data) {
        return null;
    }
    return {
        blacklisted: Boolean(data.Blacklisted),
        expiration: Number(data.Expiration ?? 0),
        queriesRemaining: Number(data.QueriesRemaining ?? 0),
        totalQueries: Number(data.TotalQueries ?? 0),
        whitelisted: Boolean(data.Whitelisted),
    };
}

export async function getAITopUsers(
    limit = 10
): Promise<Array<{ userId: string; totalQueries: number }>> {
    const docs = await AIUser.find(
        {},
        {
            _id: 0,
            TotalQueries: 1,
            UserId: 1,
        }
    )
        .sort({ TotalQueries: -1 })
        .limit(limit)
        .lean()
        .exec();

    return docs.map((doc) => ({
        totalQueries: Number(doc.TotalQueries ?? 0),
        userId: String(doc.UserId),
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

export async function getAIUserPersona(userId: string): Promise<string | null> {
    const doc = await AIUser.findOne({ UserId: userId }, { PersonaId: 1 }).lean().exec();
    const id = doc?.PersonaId?.trim();
    return id && id.length > 0 ? id : null;
}

export async function setAIUserPersona(userId: string, personaId: string | null): Promise<void> {
    const id = personaId?.trim();

    if (id && id.length > 0) {
        await AIUser.findOneAndUpdate(
            { UserId: userId },
            { $set: { PersonaId: id, UserId: userId } },
            { lean: true, upsert: true }
        ).exec();
    } else {
        await AIUser.updateOne(
            { PersonaId: { $exists: true }, UserId: userId },
            { $unset: { PersonaId: 1 } }
        ).exec();
    }
}

async function setAiUserData(userId: string, data: AIUserData): Promise<AIUserData> {
    await AIUser.findOneAndUpdate(
        { UserId: userId },
        {
            $set: {
                Blacklisted: data.blacklisted,
                Expiration: data.expiration,
                QueriesRemaining: data.queriesRemaining,
                TotalQueries: data.totalQueries,
                UserId: userId,
                Whitelisted: data.whitelisted,
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
            data: {
                blacklisted: false,
                expiration: nextExpiration,
                queriesRemaining: maxLimit - 1,
                totalQueries: 1,
                whitelisted: false,
            },
            ok: true,
        };
    }

    if (previous.blacklisted) {
        return { message: AI_BLACKLIST_MESSAGE, ok: false };
    }

    if (previous.whitelisted) {
        return {
            data: {
                ...previous,
                expiration: 1,
                queriesRemaining: maxLimit,
                totalQueries: previous.totalQueries + 1,
            },
            ok: true,
        };
    }

    if (previous.queriesRemaining > 0) {
        return {
            data: {
                ...previous,
                expiration: calculateExpiration(previous.expiration, nextExpiration),
                queriesRemaining: previous.queriesRemaining - 1,
                totalQueries: previous.totalQueries + 1,
            },
            ok: true,
        };
    }

    if (now > previous.expiration) {
        return {
            data: {
                ...previous,
                expiration: nextExpiration,
                queriesRemaining: maxLimit - 1,
                totalQueries: previous.totalQueries + 1,
            },
            ok: true,
        };
    }

    return {
        message: `You've reached your AI query limit. It resets <t:${Math.floor(
            previous.expiration / 1000
        )}:R>.`,
        ok: false,
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
                    Expiration: 1,
                    QueriesRemaining: maxLimit,
                },
                $setOnInsert: {
                    Blacklisted: false,
                    UserId: userId,
                    Whitelisted: false,
                },
            },
            { lean: true, returnDocument: 'after', upsert: true }
        ).exec();

        const adminData = toAIUserData(adminUpdated);
        if (adminData) {
            return { data: adminData, ok: true };
        }
    }

    const previousDoc = await AIUser.findOneAndUpdate(
        { UserId: userId },
        [
            {
                $set: {
                    Blacklisted: { $ifNull: ['$Blacklisted', false] },
                    Expiration: { $ifNull: ['$Expiration', 0] },
                    QueriesRemaining: { $ifNull: ['$QueriesRemaining', 0] },
                    TotalQueries: { $ifNull: ['$TotalQueries', 0] },
                    UserId: { $ifNull: ['$UserId', userId] },
                    Whitelisted: { $ifNull: ['$Whitelisted', false] },
                },
            },
            {
                $set: {
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
                    _canUseWhitelist: {
                        $and: [{ $eq: ['$Blacklisted', false] }, { $eq: ['$Whitelisted', true] }],
                    },
                },
            },
            {
                $set: {
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
                    TotalQueries: {
                        $cond: [
                            { $or: ['$_canUseWhitelist', '$_canUseNormal', '$_canUseReset'] },
                            { $add: ['$TotalQueries', 1] },
                            '$TotalQueries',
                        ],
                    },
                },
            },
            { $unset: ['_canUseWhitelist', '_canUseNormal', '_canUseReset'] },
        ],
        {
            lean: true,
            returnDocument: 'before',
            updatePipeline: true,
            upsert: true,
        }
    ).exec();

    return resolveNonAdminAvailability(toAIUserData(previousDoc), maxLimit, now, nextExpiration);
}

export async function setAIBlacklist(userId: string, blacklisted: boolean): Promise<AIUserData> {
    const maxLimit = Math.max(1, Number(config.MAX_AI_QUERIES_LIMIT || 30));
    const existing = await getAiUserData(userId);

    const next: AIUserData = {
        blacklisted,
        expiration: 1,
        queriesRemaining: maxLimit,
        totalQueries: existing?.totalQueries ?? 0,
        whitelisted: false,
    };
    return setAiUserData(userId, next);
}

export async function setAIWhitelist(userId: string, whitelisted: boolean): Promise<AIUserData> {
    const maxLimit = Math.max(1, Number(config.MAX_AI_QUERIES_LIMIT || 30));
    const existing = await getAiUserData(userId);

    const next: AIUserData = {
        blacklisted: false,
        expiration: 1,
        queriesRemaining: maxLimit,
        totalQueries: existing?.totalQueries ?? 0,
        whitelisted,
    };
    return setAiUserData(userId, next);
}

export async function resetAICooldown(userId: string): Promise<AIUserData> {
    const maxLimit = Math.max(1, Number(config.MAX_AI_QUERIES_LIMIT || 30));
    const existing = await getAiUserData(userId);
    const next: AIUserData = {
        blacklisted: existing?.blacklisted ?? false,
        expiration: 1,
        queriesRemaining: maxLimit,
        totalQueries: existing?.totalQueries ?? 0,
        whitelisted: existing?.whitelisted ?? false,
    };
    return setAiUserData(userId, next);
}

/** Deletes all AI conversation history for a single guild. Returns number of docs removed. */
export async function clearAllAIHistoryForGuild(guildId: string): Promise<number> {
    const escaped = guildId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const keyFilter = { Key: new RegExp(`^group:guild_${escaped}_`) };
    const docs = await AIHistory.find(keyFilter, { _id: 0, Key: 1 }).lean().exec();
    const keys = docs.map((d) => String(d.Key));

    const result = await AIHistory.deleteMany(keyFilter).exec();
    const deleted = result.deletedCount ?? 0;

    if (aiClient && keys.length > 0) {
        const historyManager = aiClient.getHistoryManager();
        await Promise.all(
            keys.map((key) =>
                historyManager.deleteHistory(key).catch((err) => {
                    if (config.ENABLE_LOGGING) {
                        console.warn(`Failed to clear cached AI history key '${key}':`, err);
                    }
                })
            )
        );
    }
    return deleted;
}

export async function resetAIHistory(userId: string): Promise<void> {
    const safeUser = userId.replace(/[:/\\?#%]/g, '_');
    const suffix = `_user:${safeUser}`;
    const keyFilter = {
        $or: [{ Key: `user:${safeUser}` }, { Key: { $regex: `${suffix}$` } }],
    };

    // Capture keys first so we can also clear in-memory cache in OpenRouter Kit.
    const docs = await AIHistory.find(keyFilter, { _id: 0, Key: 1 }).lean().exec();
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
