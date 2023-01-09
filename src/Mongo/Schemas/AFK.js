import { Schema, model } from 'mongoose';

const AFK = new Schema({
  _id: Schema.Types.ObjectId,
  idJoined: { type: String, unique: true },
  guildId: String,
  userId: String,
  reason: String
});

export default model('AFK', AFK, 'AFK');
