import { model, Schema } from 'mongoose';

/**
 * Represents a schema for storing the data for the RoleMenu within a guild.
 */
const RoleMenu = new Schema({
    GuildId: { type: String, unique: true },
    RoleList: { default: [], type: Array },
    RoleMenuId: {
        channel: { default: null, type: String },
        message: { default: null, type: String },
    },
});

export default model('RoleMenu', RoleMenu, 'RoleMenu');
