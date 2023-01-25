import { Schema, model } from 'mongoose';

const Welcome = new Schema({
  GuildId: { type: String, unique: true },
  ChannelId: String,
  Image: String
});

export default model('Welcome', Welcome, 'Welcome');
