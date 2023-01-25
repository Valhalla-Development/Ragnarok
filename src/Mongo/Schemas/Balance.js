import { Schema, model } from 'mongoose';

const Balance = new Schema({
  IdJoined: { type: String, unique: true },
  UserId: String,
  GuildId: String,
  Hourly: Number,
  Daily: Number,
  Weekly: Number,
  Monthly: Number,
  StealCool: Number,
  FishCool: Number,
  FarmCool: Number,
  Boosts: String,
  Items: String,
  Cash: Number,
  Bank: Number,
  Total: Number,
  ClaimNewUser: Number,
  FarmPlot: String,
  DmHarvest: String,
  HarvestedCrops: String,
  Lottery: String
});

export default model('Balance', Balance, 'Balance');
