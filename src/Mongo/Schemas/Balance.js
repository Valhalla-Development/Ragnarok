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
  Boosts: {
    FishBag: { type: Number, default: null },
    SeedBag: { type: Number, default: null },
    FarmBag: { type: Number, default: null },
    FarmPlot: { type: Number, default: null }
  },
  Items: {
    Trout: { type: Number, default: 0 },
    KingSalmon: { type: Number, default: 0 },
    SwordFish: { type: Number, default: 0 },
    PufferFish: { type: Number, default: 0 },
    Treasure: { type: Number, default: 0 },
    GoldBar: { type: Number, default: 0 },
    GoldNugget: { type: Number, default: 0 },
    Barley: { type: Number, default: 0 },
    Spinach: { type: Number, default: 0 },
    Strawberries: { type: Number, default: 0 },
    Lettuce: { type: Number, default: 0 },
    CornSeeds: { type: Number, default: 0 },
    WheatSeeds: { type: Number, default: 0 },
    PotatoSeeds: { type: Number, default: 0 },
    TomatoSeeds: { type: Number, default: 0 },
    FarmingTools: { type: Boolean, default: false },
    FishingRod: { type: Boolean, default: false }
  },
  Cash: { type: Number, default: null },
  Bank: { type: Number, default: null },
  Total: { type: Number, default: null },
  ClaimNewUser: { type: Number, default: null },
  FarmPlot: { type: Array, default: null },
  DmHarvest: { type: String, default: null },
  HarvestedCrops: { type: Array, default: null }
});

export default model('Balance', Balance, 'Balance');
