import { Schema, model } from 'mongoose';

const LevelConfig = new Schema({
  _id: Schema.Types.ObjectId,
  guildId: { type: String, unique: true },
  status: Boolean
});

export default model('LevelConfig', LevelConfig, 'LevelConfig');
