import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the users birthdays
 */
const Birthdays = new Schema({
    AnnouncementAttempts: { default: {}, type: Schema.Types.Mixed },
    Date: { default: null, type: String },
    LastRun: { default: {}, type: Schema.Types.Mixed },
    UserId: { type: String, unique: true },
});

export default model('Birthdays', Birthdays, 'Birthdays');
