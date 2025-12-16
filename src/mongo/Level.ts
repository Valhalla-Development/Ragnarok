import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the users Level data
 */
const Level = new Schema({
    IdJoined: { type: String, unique: true },
    UserId: { type: String, default: null },
    GuildId: { type: String, default: null },
    Xp: { type: Number, default: null },
    Level: { type: Number, default: null },
    Country: { type: String, default: null },
});

export default model('Level', Level, 'Level');
