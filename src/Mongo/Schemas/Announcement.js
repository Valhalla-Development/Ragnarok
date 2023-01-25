import { Schema, model } from 'mongoose';

const Announcement = new Schema({
  Message: { type: String, unique: true }
});

export default model('Announcement', Announcement, 'Announcement');
