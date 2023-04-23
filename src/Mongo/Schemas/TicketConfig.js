import { Schema, model } from 'mongoose';

const TicketConfig = new Schema({
  GuildId: { type: String, unique: true },
  Category: { type: String, default: null },
  LogChannel: { type: String, default: null },
  Role: { type: String, default: null },
  Embed: { type: String, default: null },
  EmbedChannel: { type: String, default: null },
  Blacklist: { type: Array, default: [] }
});

export default model('TicketConfig', TicketConfig, 'TicketConfig');
