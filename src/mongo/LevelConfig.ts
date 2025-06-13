import { Schema, model } from 'mongoose';

/**
 * Represents a schema for storing the status of the Level module in a guild.
 */
const LevelConfig = new Schema({
    GuildId: { type: String, unique: true },
    Status: { type: Boolean, default: null },
});

export default model('LevelConfig', LevelConfig, 'LevelConfig');
