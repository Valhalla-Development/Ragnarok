import { Schema, model } from 'mongoose';

const StarBoard = new Schema({
  GuildId: { type: String, unique: true },
  ChannelId: String
});

export default model('StarBoard', StarBoard, 'StarBoard');
