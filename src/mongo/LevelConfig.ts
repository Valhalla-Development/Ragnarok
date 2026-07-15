import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the status of the Level module in a guild.
 */
const LevelConfig = new Schema({
    GuildId: { type: String, unique: true },
    Status: { default: null, type: Boolean },
});

export default model('LevelConfig', LevelConfig, 'LevelConfig');
