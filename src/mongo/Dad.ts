import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the status of the Dad module within a guild..
 */
const Dad = new Schema({
    GuildId: { type: String, unique: true },
    Status: { type: Boolean, default: null },
});

export default model('Dad', Dad, 'Dad');
