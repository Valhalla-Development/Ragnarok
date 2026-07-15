import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the users Level data
 */
const Level = new Schema({
    GuildId: { default: null, type: String },
    IdJoined: { type: String, unique: true },
    Level: { default: null, type: Number },
    UserId: { default: null, type: String },
    Xp: { default: null, type: Number },
});

export default model('Level', Level, 'Level');
