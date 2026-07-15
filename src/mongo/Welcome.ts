import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the data for Welcome within a guild.
 */
const Welcome = new Schema({
    ChannelId: { default: null, type: String },
    GuildId: { type: String, unique: true },
    Image: { default: null, type: String },
});

export default model('Welcome', Welcome, 'Welcome');
