import { Schema, model } from 'mongoose';

const AntiScam = new Schema({
  GuildId: { type: String, unique: true },
  Status: { type: Boolean, default: null }
});

export default model('AntiScam', AntiScam, 'AntiScam');
