import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the status of Advert Protection in a guild.
 */
const AdsProtection = new Schema({
    GuildId: { type: String, unique: true },
    Status: { default: null, type: Boolean },
});

export default model('AdsProtection', AdsProtection, 'AdsProtection');
