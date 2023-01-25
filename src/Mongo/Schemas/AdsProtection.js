import { Schema, model } from 'mongoose';

const AdsProtection = new Schema({
  GuildId: { type: String, unique: true },
  Status: Boolean
});

export default model('AdsProtection', AdsProtection, 'AdsProtection');
