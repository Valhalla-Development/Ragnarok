import { Schema, model } from 'mongoose';

const Announcement = new Schema({
  message: { type: String, unique: true }
});

export default model('Announcement', Announcement, 'Announcement');
