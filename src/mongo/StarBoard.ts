import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the state of the StarBoard module
 */
const StarBoard = new Schema({
    ChannelId: { default: null, type: String },
    GuildId: { type: String, unique: true },
});

export default model('StarBoard', StarBoard, 'StarBoard');
