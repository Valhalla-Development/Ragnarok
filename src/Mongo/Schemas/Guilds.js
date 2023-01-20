import { Schema, model } from 'mongoose';

const Guilds = new Schema({
  guildId: { type: String, unique: true },
  name: String,
  iconUrl: String
});

export default model('Guilds', Guilds, 'Guilds');
