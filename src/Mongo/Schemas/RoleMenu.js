import { Schema, model } from 'mongoose';

const RoleMenu = new Schema({
  GuildId: { type: String, unique: true },
  RoleMenuId: String,
  RoleList: String
});

export default model('RoleMenu', RoleMenu, 'RoleMenu');
