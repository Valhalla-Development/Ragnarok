import { Schema, model } from 'mongoose';

const AntiScam = new Schema({
  GuildId: { type: String, unique: true },
  Status: Boolean
});

export default model('AntiScam', AntiScam, 'AntiScam');
