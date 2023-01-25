import { Schema, model } from 'mongoose';

const Dad = new Schema({
  GuildId: { type: String, unique: true },
  Status: Boolean
});

export default model('Dad', Dad, 'Dad');
