import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the Honeypot trap channel data within a guild.
 */
const Honeypot = new Schema({
    GuildId: { type: String, unique: true },
    ChannelId: { type: String, default: null },
});

export default model('Honeypot', Honeypot, 'Honeypot');
