import { Schema, model } from 'mongoose';

const Dad = new Schema({
  GuildId: { type: String, unique: true },
  Status: { type: Boolean, default: null }
});

export default model('Dad', Dad, 'Dad');
