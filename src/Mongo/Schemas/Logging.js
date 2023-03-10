import { Schema, model } from 'mongoose';

const Logging = new Schema({
  GuildId: { type: String, unique: true },
  ChannelId: { type: String, default: null }
});

export default model('Logging', Logging, 'Logging');
