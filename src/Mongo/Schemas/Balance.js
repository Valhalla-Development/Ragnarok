import { Schema, model } from 'mongoose';

const Balance = new Schema({
  IdJoined: { type: String, unique: true },
  UserId: { type: String, default: null },
  GuildId: { type: String, default: null },
  Hourly: { type: Number, default: null },
  Daily: { type: Number, default: null },
  Weekly: { type: Number, default: null },
  Monthly: { type: Number, default: null },
  StealCool: { type: Number, default: null },
  FishCool: { type: Number, default: null },
  FarmCool: { type: Number, default: null },
  Boosts: { type: String, default: null },
  Items: { type: String, default: null },
  Cash: { type: Number, default: null },
  Bank: { type: Number, default: null },
  Total: { type: Number, default: null },
  ClaimNewUser: { type: Number, default: null },
  FarmPlot: { type: String, default: null },
  DmHarvest: { type: String, default: null },
  HarvestedCrops: { type: String, default: null },
  Lottery: { type: String, default: null }
});

export default model('Balance', Balance, 'Balance');
