import { Schema, model } from 'mongoose';

const Welcome = new Schema({
  _id: Schema.Types.ObjectId,
  guildId: { type: String, unique: true },
  channel: String,
  image: String
});

export default model('Welcome', Welcome, 'Welcome');
