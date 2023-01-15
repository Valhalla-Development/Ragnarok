import { Schema, model } from 'mongoose';

const AFK = new Schema({
  idJoined: { type: String, unique: true },
  guildId: String,
  userId: String,
  reason: String
});

export default model('AFK', AFK);
