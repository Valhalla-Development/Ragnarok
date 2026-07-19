import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the Honeypot trap channel data within a guild.
 */
const Honeypot = new Schema({
    ActionCount: { default: 0, type: Number },
    ChannelId: { default: null, type: String },
    GuildId: { type: String, unique: true },
    Mode: { default: 'ban', type: String },
    WarningMessageId: { default: null, type: String },
});

export default model('Honeypot', Honeypot, 'Honeypot');
