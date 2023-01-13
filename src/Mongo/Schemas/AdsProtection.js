import { Schema, model } from 'mongoose';

const AdsProtection = new Schema({
  guildId: { type: String, unique: true },
  status: Boolean
});

export default model('AdsProtection', AdsProtection, 'AdsProtection');
