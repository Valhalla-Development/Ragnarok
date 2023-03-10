import { Schema, model } from 'mongoose';

const Hastebin = new Schema({
  GuildId: { type: String, unique: true },
  Status: { type: Boolean, default: null }
});

export default model('Hastebin', Hastebin, 'Hastebin');
