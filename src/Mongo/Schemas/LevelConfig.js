import { Schema, model } from 'mongoose';

const LevelConfig = new Schema({
  GuildId: { type: String, unique: true },
  Status: Boolean
});

export default model('LevelConfig', LevelConfig, 'LevelConfig');
