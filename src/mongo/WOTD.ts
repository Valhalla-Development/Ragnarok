import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the data for Word of the Day.
 */
const WOTD = new Schema({
    Date: { type: String, unique: true },
    Definition: { required: true, type: String },
    Example: { required: true, type: String },
    FetchedAt: { default: Date.now, type: Date },
    Syllables: { required: true, type: String },
    Type: { required: true, type: String },
    Word: { required: true, type: String },
});

export default model('WOTD', WOTD, 'WOTD');
