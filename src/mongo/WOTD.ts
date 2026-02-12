import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the data for Word of the Day.
 */
const WOTD = new Schema({
    Date: { type: String, unique: true },
    Word: { type: String, required: true },
    Type: { type: String, required: true },
    Syllables: { type: String, required: true },
    Definition: { type: String, required: true },
    Example: { type: String, required: true },
    FetchedAt: { type: Date, default: Date.now },
});

export default model('WOTD', WOTD, 'WOTD');
