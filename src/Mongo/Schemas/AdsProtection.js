import { Schema, model } from 'mongoose';

const AdsProtection = new Schema({
  GuildId: { type: String, unique: true },
  Status: { type: Boolean, default: null }
});

export default model('AdsProtection', AdsProtection, 'AdsProtection');
