import { type InferSchemaType, model, Schema } from 'mongoose';

/**
 * Single-document collection for global AI usage stats.
 */
const AIGlobalStats = new Schema({
    TotalCost: { default: 0, type: Number },
    TotalQueries: { default: 0, type: Number },
});

export type AIGlobalStatsInterface = InferSchemaType<typeof AIGlobalStats>;

export default model('AIGlobalStats', AIGlobalStats, 'AIGlobalStats');
