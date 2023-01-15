import { Schema, model } from 'mongoose';

const AntiScam = new Schema({
  guildId: { type: String, unique: true },
  status: Boolean
});

export default model('AntiScam', AntiScam, 'AntiScam');
