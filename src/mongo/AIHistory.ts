import { type InferSchemaType, model, Schema } from 'mongoose';

const AIHistory = new Schema({
    Entries: { default: [], type: [Schema.Types.Mixed] },
    Key: { index: true, required: true, type: String, unique: true },
    UpdatedAt: { default: Date.now, type: Number },
});

export type AIHistoryInterface = InferSchemaType<typeof AIHistory>;

export default model('AIHistory', AIHistory, 'AIHistory');
