import { type InferSchemaType, model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the Balance data for users in a guild.
 */
const Balance = new Schema({
    Bank: { default: null, type: Number },
    Boosts: {
        AutoDeposit: { default: false, type: Boolean },
        FarmBag: { default: null, type: Number },
        FarmPlot: { default: null, type: Number },
        FishBag: { default: null, type: Number },
        SeedBag: { default: null, type: Number },
    },
    Cash: { default: null, type: Number },
    ClaimNewUser: { default: null, type: Number },
    Daily: { default: null, type: Number },
    DmHarvest: { default: null, type: String },
    FarmCool: { default: null, type: Number },
    FarmPlot: [
        {
            CropGrowTime: { required: true, type: Schema.Types.Mixed },
            CropStatus: { required: true, type: String },
            CropType: { required: true, type: String },
            Decay: { default: 0, type: Number },
            LastUpdateTime: { default: Date.now, type: Number },
        },
    ],
    FishCool: { default: null, type: Number },
    GuildId: { default: null, type: String },
    HarvestedCrops: [
        {
            CropGrowTime: { required: true, type: Schema.Types.Mixed },
            CropStatus: { required: true, type: String },
            CropType: { required: true, type: String },
            Decay: { default: 0, type: Number },
            LastUpdateTime: { default: Date.now, type: Number },
        },
    ],
    Hourly: { default: null, type: Number },
    IdJoined: { type: String, unique: true },
    Items: {
        Barley: { default: 0, type: Number },
        CornSeeds: { default: 0, type: Number },
        FarmingTools: { default: false, type: Boolean },
        FishingRod: { default: false, type: Boolean },
        GoldBar: { default: 0, type: Number },
        GoldNugget: { default: 0, type: Number },
        KingSalmon: { default: 0, type: Number },
        Lettuce: { default: 0, type: Number },
        PotatoSeeds: { default: 0, type: Number },
        PufferFish: { default: 0, type: Number },
        Spinach: { default: 0, type: Number },
        Strawberries: { default: 0, type: Number },
        SwordFish: { default: 0, type: Number },
        TomatoSeeds: { default: 0, type: Number },
        Treasure: { default: 0, type: Number },
        Trout: { default: 0, type: Number },
        WheatSeeds: { default: 0, type: Number },
    },
    Monthly: { default: null, type: Number },
    StealCool: { default: null, type: Number },
    Total: { default: null, type: Number },
    UserId: { default: null, type: String },
    Weekly: { default: null, type: Number },
});

export type BalanceInterface = InferSchemaType<typeof Balance>;

export default model('Balance', Balance, 'Balance');
