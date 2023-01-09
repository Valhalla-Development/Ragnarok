import { Schema, model } from 'mongoose';

const Level = new Schema({
  _id: Schema.Types.ObjectId,
  idJoined: { type: String, unique: true },
  userId: String,
  guildId: String,
  xp: Number,
  level: Number,
  country: String,
  image: String
});

export default model('Level', Level, 'Level');
