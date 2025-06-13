import { Schema, model } from 'mongoose';

/**
 * Represents a schema for storing the state of the StarBoard module
 */
const StarBoard = new Schema({
    GuildId: { type: String, unique: true },
    ChannelId: { type: String, default: null },
});

export default model('StarBoard', StarBoard, 'StarBoard');
