import { Schema, model } from 'mongoose';

const Hastebin = new Schema({
  guildId: { type: String, unique: true },
  status: Boolean
});

export default model('Hastebin', Hastebin);
