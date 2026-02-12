import { type InferSchemaType, model, Schema } from 'mongoose';

const AIUser = new Schema({
    UserId: { type: String, required: true, unique: true, index: true },
    TotalQueries: { type: Number, default: 0 },
    QueriesRemaining: { type: Number, default: 0 },
    Expiration: { type: Number, default: 0 },
    Whitelisted: { type: Boolean, default: false },
    Blacklisted: { type: Boolean, default: false },
});

export type AIUserInterface = InferSchemaType<typeof AIUser>;

export default model('AIUser', AIUser, 'AIUser');
