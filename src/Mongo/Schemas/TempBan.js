import { Schema, model } from 'mongoose';

const TempBan = new Schema({
  IdJoined: { type: String, unique: true },
  GuildId: { type: String, default: null },
  UserId: { type: String, default: null },
  EndTime: { type: String, default: null },
  ChannelId: { type: String, default: null },
  Username: { type: String, default: null }
});

export default model('TempBan', TempBan, 'TempBan');
