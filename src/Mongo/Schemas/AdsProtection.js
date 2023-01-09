import { Schema, model } from 'mongoose';

const AdsProtection = new Schema({
  _id: Schema.Types.ObjectId,
  guildId: { type: String, unique: true },
  status: Boolean
});

export default model('AdsProtection', AdsProtection, 'AdsProtection');
