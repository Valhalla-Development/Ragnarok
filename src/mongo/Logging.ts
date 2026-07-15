import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the Logging module state data
 */
const Logging = new Schema({
    ChannelId: { default: null, type: String },
    GuildId: { type: String, unique: true },
});

export default model('Logging', Logging, 'Logging');
