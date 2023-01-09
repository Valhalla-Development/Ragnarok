import { Schema, model } from 'mongoose';

const TempBan = new Schema({
  _id: Schema.Types.ObjectId,
  idJoined: { type: String, unique: true },
  guildId: String,
  userId: String,
  endTime: String,
  channel: String,
  username: String
});

export default model('TempBan', TempBan, 'TempBan');
