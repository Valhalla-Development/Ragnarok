import { Schema, model } from 'mongoose';

const StarBoard = new Schema({
  GuildId: { type: String, unique: true },
  ChannelId: { type: String, default: null }
});

export default model('StarBoard', StarBoard, 'StarBoard');
