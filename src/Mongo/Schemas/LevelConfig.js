import { Schema, model } from 'mongoose';

const LevelConfig = new Schema({
  GuildId: { type: String, unique: true },
  Status: { type: Boolean, default: null }
});

export default model('LevelConfig', LevelConfig, 'LevelConfig');
