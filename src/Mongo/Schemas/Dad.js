import { Schema, model } from 'mongoose';

const Dad = new Schema({
  _id: Schema.Types.ObjectId,
  guildId: { type: String, unique: true },
  status: Boolean
});

export default model('Dad', Dad, 'Dad');
