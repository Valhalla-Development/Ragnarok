import { Schema, model } from 'mongoose';

const TempBan = new Schema({
  IdJoined: { type: String, unique: true },
  GuildId: String,
  UserId: String,
  EndTime: String,
  ChannelId: String,
  Username: String
});

export default model('TempBan', TempBan, 'TempBan');
