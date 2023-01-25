import { Schema, model } from 'mongoose';

const AFK = new Schema({
  IdJoined: { type: String, unique: true },
  GuildId: String,
  UserId: String,
  Reason: String
});

export default model('AFK', AFK, 'AFK');
