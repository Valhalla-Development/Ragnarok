import { Schema, model } from 'mongoose';

const BirthdayConfig = new Schema({
  _id: Schema.Types.ObjectId,
  guildId: { type: String, unique: true },
  channel: String,
  role: String
});

export default model('BirthdayConfig', BirthdayConfig, 'BirthdayConfig');
