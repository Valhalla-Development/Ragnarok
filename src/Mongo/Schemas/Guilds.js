import { Schema, model } from 'mongoose';

const Guilds = new Schema({
  GuildId: { type: String, unique: true },
  Name: String,
  IconUrl: String
});

export default model('Guilds', Guilds, 'Guilds');
