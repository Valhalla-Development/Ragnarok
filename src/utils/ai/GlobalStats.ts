import AIGlobalStats from '../../mongo/AIGlobalStats.js';

/**
 * Records a successful AI query for global stats.
 */
export async function recordAIGlobalUsage(params: {
    queries?: number;
    cost?: number;
}): Promise<void> {
    const queries = Math.max(0, Number(params.queries ?? 1));
    const cost = Math.max(0, Number(params.cost ?? 0));

    await AIGlobalStats.findOneAndUpdate(
        {},
        { $inc: { TotalQueries: queries, TotalCost: cost } },
        { upsert: true }
    ).exec();
}

export interface AIGlobalStatsResult {
    totalQueries: number;
    totalCost: number;
}

/**
 * Fetches global AI usage statistics.
 */
export async function getAIGlobalStats(): Promise<AIGlobalStatsResult> {
    const doc = await AIGlobalStats.findOne().lean().exec();
    return {
        totalQueries: Number(doc?.TotalQueries ?? 0),
        totalCost: Number(doc?.TotalCost ?? 0),
    };
}
