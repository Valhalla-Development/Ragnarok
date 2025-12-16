import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the Ticket module data
 */
const Tickets = new Schema({
    GuildId: { type: String, default: null },
    TicketId: { type: String, unique: true },
    AuthorId: { type: String, default: null },
    Reason: { type: String, default: null },
    ChannelId: { type: String, default: null },
});

export default model('Tickets', Tickets, 'Tickets');
