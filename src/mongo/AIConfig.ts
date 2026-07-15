import { type InferSchemaType, model, Schema } from 'mongoose';

const AIConfig = new Schema({
    AllowedChannelIds: { default: [], type: [String] },
    Enabled: { default: true, type: Boolean },
    GuildId: { index: true, required: true, type: String, unique: true },
    PersonaId: { default: 'friendly', type: String },
});

export type AIConfigInterface = InferSchemaType<typeof AIConfig>;

export default model('AIConfig', AIConfig, 'AIConfig');
