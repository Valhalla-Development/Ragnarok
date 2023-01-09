import { Schema, model } from 'mongoose';

const RoleMenu = new Schema({
  _id: Schema.Types.ObjectId,
  guildId: { type: String, unique: true },
  roleMenuId: String,
  roleList: String
});

export default model('RoleMenu', RoleMenu, 'RoleMenu');
