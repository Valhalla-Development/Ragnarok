import { type InferSchemaType, model, Schema } from 'mongoose';

const AIConfig = new Schema({
    GuildId: { type: String, required: true, unique: true, index: true },
    Enabled: { type: Boolean, default: true },
    AllowedChannelIds: { type: [String], default: [] },
    PersonaId: { type: String, default: 'friendly' },
});

export type AIConfigInterface = InferSchemaType<typeof AIConfig>;

export default model('AIConfig', AIConfig, 'AIConfig');
