import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the data for AutoRole within a guild.
 */
const AutoRole = new Schema({
    GuildId: { type: String, unique: true },
    Role: { type: String, default: null },
});

export default model('AutoRole', AutoRole, 'AutoRole');
