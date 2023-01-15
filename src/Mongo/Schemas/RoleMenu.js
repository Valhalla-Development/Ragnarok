import { Schema, model } from 'mongoose';

const RoleMenu = new Schema({
  guildId: { type: String, unique: true },
  roleMenuId: String,
  roleList: String
});

export default model('RoleMenu', RoleMenu, 'RoleMenu');
