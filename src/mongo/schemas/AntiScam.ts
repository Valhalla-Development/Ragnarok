import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the status of Anti Scam in a guild.
 */
const AntiScam = new Schema({
    GuildId: { type: String, unique: true },
    Status: { type: Boolean, default: null },
});

export default model('AntiScam', AntiScam, 'AntiScam');
