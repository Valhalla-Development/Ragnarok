import { Schema, model } from 'mongoose';

const StarBoard = new Schema({
  _id: Schema.Types.ObjectId,
  guildId: { type: String, unique: true },
  channel: String
});

export default model('StarBoard', StarBoard, 'StarBoard');
