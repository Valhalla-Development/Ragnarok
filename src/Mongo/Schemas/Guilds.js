import { Schema, model } from 'mongoose';

const Guilds = new Schema({
  GuildId: { type: String, unique: true },
  Name: { type: String, default: null },
  IconUrl: { type: String, default: null }
});

export default model('Guilds', Guilds, 'Guilds');
