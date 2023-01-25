import { Schema, model } from 'mongoose';

const Level = new Schema({
  IdJoined: { type: String, unique: true },
  UserId: String,
  GuildId: String,
  Xp: Number,
  Level: Number,
  Country: String,
  Image: String
});

export default model('Level', Level, 'Level');
