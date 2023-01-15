import { Schema, model } from 'mongoose';

const AutoRole = new Schema({
  guildId: { type: String, unique: true },
  role: String
});

export default model('AutoRole', AutoRole);
