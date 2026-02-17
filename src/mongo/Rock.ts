import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the status of the Rock module within a guild.
 * Default on: no document = enabled. Disable = Status: false.
 */
const Rock = new Schema({
    GuildId: { type: String, unique: true },
    Status: { type: Boolean, default: true },
});

export default model('Rock', Rock, 'Rock');
