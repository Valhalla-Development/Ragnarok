import { Schema, model } from 'mongoose';

const AutoRole = new Schema({
  _id: Schema.Types.ObjectId,
  guildId: { type: String, unique: true },
  role: String
});

export default model('AutoRole', AutoRole, 'AutoRole');
