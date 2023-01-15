import { Schema, model } from 'mongoose';

const Balance = new Schema({
  idJoined: { type: String, unique: true },
  user: String,
  guildId: String,
  hourly: Number,
  daily: Number,
  weekly: Number,
  monthly: Number,
  stealCool: Number,
  fishCool: Number,
  farmCool: Number,
  boosts: String,
  items: String,
  cash: Number,
  bank: Number,
  total: Number,
  claimNewUser: Number,
  farmPlot: String,
  dmHarvest: String,
  harvestedCrops: String,
  lottery: String
});

export default model('Balance', Balance);
