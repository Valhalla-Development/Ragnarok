import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the status of the Birthday module in a guild.
 */
const BirthdayConfig = new Schema({
    GuildId: { type: String, unique: true },
    ChannelId: { type: String, default: null },
    Role: { type: String, default: null },
});

export default model('BirthdayConfig', BirthdayConfig, 'BirthdayConfig');
