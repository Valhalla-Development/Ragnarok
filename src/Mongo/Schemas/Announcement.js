import { Schema, model } from 'mongoose';

const Announcement = new Schema({
  _id: Schema.Types.ObjectId,
  message: { type: String, unique: true }
});

export default model('Announcement', Announcement, 'Announcement');
