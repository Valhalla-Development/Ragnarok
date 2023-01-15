import { Schema, model } from 'mongoose';

const Welcome = new Schema({
  guildId: { type: String, unique: true },
  channel: String,
  image: String
});

export default model('Welcome', Welcome);
