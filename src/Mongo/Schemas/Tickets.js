import { Schema, model } from 'mongoose';

const Tickets = new Schema({
  _id: Schema.Types.ObjectId,
  guildId: String,
  ticketId: { type: String, unique: true },
  authorId: String,
  reason: String,
  channelId: String
});

export default model('Tickets', Tickets, 'Tickets');
