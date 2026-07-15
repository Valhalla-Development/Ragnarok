import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the users birthdays
 */
const Birthdays = new Schema({
    Date: { default: null, type: String },
    LastRun: { default: [], type: Array },
    UserId: { type: String, unique: true },
});

export default model('Birthdays', Birthdays, 'Birthdays');
