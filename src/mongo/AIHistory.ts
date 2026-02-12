import { type InferSchemaType, model, Schema } from 'mongoose';

const AIHistory = new Schema({
    Key: { type: String, required: true, unique: true, index: true },
    Entries: { type: [Schema.Types.Mixed], default: [] },
    UpdatedAt: { type: Number, default: Date.now },
});

export type AIHistoryInterface = InferSchemaType<typeof AIHistory>;

export default model('AIHistory', AIHistory, 'AIHistory');
