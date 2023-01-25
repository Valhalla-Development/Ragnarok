import { Schema, model } from 'mongoose';

const Tickets = new Schema({
  GuildId: String,
  TicketId: { type: String, unique: true },
  AuthorId: String,
  Reason: String,
  ChannelId: String
});

export default model('Tickets', Tickets, 'Tickets');
