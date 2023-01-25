import { Schema, model } from 'mongoose';

const Logging = new Schema({
  GuildId: { type: String, unique: true },
  ChannelId: String
});

export default model('Logging', Logging, 'Logging');
