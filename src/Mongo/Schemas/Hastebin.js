import { Schema, model } from 'mongoose';

const Hastebin = new Schema({
  GuildId: { type: String, unique: true },
  Status: Boolean
});

export default model('Hastebin', Hastebin, 'Hastebin');
