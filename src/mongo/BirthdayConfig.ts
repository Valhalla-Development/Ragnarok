import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the status of the Birthday module in a guild.
 */
const BirthdayConfig = new Schema({
    ChannelId: { default: null, type: String },
    GuildId: { type: String, unique: true },
});

export default model('BirthdayConfig', BirthdayConfig, 'BirthdayConfig');
