import { Schema, model } from 'mongoose';

const TicketConfig = new Schema({
  _id: Schema.Types.ObjectId,
  guildId: { type: String, unique: true },
  category: String,
  logChannel: String,
  role: String,
  embed: String,
  embedChannel: String,
  blacklist: String
});

export default model('TicketConfig', TicketConfig, 'TicketConfig');
