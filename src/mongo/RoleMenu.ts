import { Schema, model } from 'mongoose';

/**
 * Represents a schema for storing the data for the RoleMenu within a guild.
 */
const RoleMenu = new Schema({
    GuildId: { type: String, unique: true },
    RoleMenuId: {
        channel: { type: String, default: null },
        message: { type: String, default: null },
    },
    RoleList: { type: Array, default: [] },
});

export default model('RoleMenu', RoleMenu, 'RoleMenu');
