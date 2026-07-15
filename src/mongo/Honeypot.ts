import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the Honeypot trap channel data within a guild.
 */
const Honeypot = new Schema({
    ChannelId: { default: null, type: String },
    GuildId: { type: String, unique: true },
});

export default model('Honeypot', Honeypot, 'Honeypot');
