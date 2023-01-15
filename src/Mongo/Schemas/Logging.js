import { Schema, model } from 'mongoose';

const Logging = new Schema({
  guildId: { type: String, unique: true },
  channel: String
});

export default model('Logging', Logging, 'Logging');
