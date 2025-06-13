import { Schema, model } from 'mongoose';

/**
 * Represents a schema for storing the data for Welcome within a guild.
 */
const Welcome = new Schema({
    GuildId: { type: String, unique: true },
    ChannelId: { type: String, default: null },
    Image: { type: String, default: null },
});

export default model('Welcome', Welcome, 'Welcome');
