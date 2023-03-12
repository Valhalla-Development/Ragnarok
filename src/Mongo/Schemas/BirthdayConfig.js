import { Schema, model } from 'mongoose';

const BirthdayConfig = new Schema({
  GuildId: { type: String, unique: true },
  ChannelId: { type: String, default: null },
  Role: { type: String, default: null }
});

export default model('BirthdayConfig', BirthdayConfig, 'BirthdayConfig');
