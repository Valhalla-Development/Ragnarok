import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the state of users AFK status
 */
const AFK = new Schema({
    IdJoined: { type: String, unique: true },
    GuildId: { type: String, default: null },
    UserId: { type: String, default: null },
    Reason: { type: String, default: null },
});

export default model('AFK', AFK, 'AFK');
