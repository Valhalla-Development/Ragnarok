import { Schema, model } from 'mongoose';

const AutoRole = new Schema({
  GuildId: { type: String, unique: true },
  Role: { type: String, default: null }
});

export default model('AutoRole', AutoRole, 'AutoRole');
