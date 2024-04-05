import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the TicketConfig data for a guild.
 */
const TicketConfig = new Schema({
    GuildId: { type: String, unique: true },
    Category: { type: String, default: null },
    LogChannel: { type: String, default: null },
    Role: { type: String, default: null },
    Embed: { type: String, default: null },
    EmbedChannel: { type: String, default: null },
    Blacklist: { type: Array, default: [] },
});

export default model('TicketConfig', TicketConfig, 'TicketConfig');
