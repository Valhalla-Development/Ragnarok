import { Schema, model } from 'mongoose';

const Hastebin = new Schema({
  _id: Schema.Types.ObjectId,
  guildId: { type: String, unique: true },
  status: Boolean
});

export default model('Hastebin', Hastebin, 'Hastebin');
