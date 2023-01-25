import { Schema, model } from 'mongoose';

const AutoRole = new Schema({
  GuildId: { type: String, unique: true },
  Role: String
});

export default model('AutoRole', AutoRole, 'AutoRole');
