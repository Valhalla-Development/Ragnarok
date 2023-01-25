import { Schema, model } from 'mongoose';

const TicketConfig = new Schema({
  GuildId: { type: String, unique: true },
  Category: String,
  LogChannel: String,
  Role: String,
  Embed: String,
  EmbedChannel: String,
  Blacklist: String
});

export default model('TicketConfig', TicketConfig, 'TicketConfig');
