import { Schema, model } from 'mongoose';

/**
 * Represents a schema for storing bot announcements.
 */
const Announcement = new Schema({
    Message: { type: String, unique: true },
});

export default model('Announcement', Announcement, 'Announcement');
