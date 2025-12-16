import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the Logging module state data
 */
const Logging = new Schema({
    GuildId: { type: String, unique: true },
    ChannelId: { type: String, default: null },
});

export default model('Logging', Logging, 'Logging');
