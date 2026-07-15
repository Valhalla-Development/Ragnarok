import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the status of the Dad module within a guild..
 */
const Dad = new Schema({
    GuildId: { type: String, unique: true },
    Status: { default: null, type: Boolean },
});

export default model('Dad', Dad, 'Dad');
