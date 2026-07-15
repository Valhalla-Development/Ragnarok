import { type InferSchemaType, model, Schema } from 'mongoose';

const AIUser = new Schema({
    Blacklisted: { default: false, type: Boolean },
    Expiration: { default: 0, type: Number },
    PersonaId: { default: null, type: String },
    QueriesRemaining: { default: 0, type: Number },
    TotalQueries: { default: 0, type: Number },
    UserId: { index: true, required: true, type: String, unique: true },
    Whitelisted: { default: false, type: Boolean },
});

export type AIUserInterface = InferSchemaType<typeof AIUser>;

export default model('AIUser', AIUser, 'AIUser');
