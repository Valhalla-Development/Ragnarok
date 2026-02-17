import { type InferSchemaType, model, Schema } from 'mongoose';

/**
 * Single-document collection for global AI usage stats.
 */
const AIGlobalStats = new Schema({
    TotalQueries: { type: Number, default: 0 },
    TotalCost: { type: Number, default: 0 },
});

export type AIGlobalStatsInterface = InferSchemaType<typeof AIGlobalStats>;

export default model('AIGlobalStats', AIGlobalStats, 'AIGlobalStats');
