import { Schema, model } from 'mongoose';

const BirthdayConfig = new Schema({
  GuildId: { type: String, unique: true },
  ChannelId: String,
  Role: String
});

export default model('BirthdayConfig', BirthdayConfig, 'BirthdayConfig');
