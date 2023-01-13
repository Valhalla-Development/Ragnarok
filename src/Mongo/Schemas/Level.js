import { Schema, model } from 'mongoose';

const Level = new Schema({
  idJoined: { type: String, unique: true },
  userId: String,
  guildId: String,
  xp: Number,
  level: Number,
  country: String,
  image: String
});

export default model('Level', Level, 'Level');
