import { Schema, model } from 'mongoose';

const Birthdays = new Schema({
  UserId: { type: String, unique: true },
  Date: { type: String, default: null },
  LastRun: { type: Array, default: null }
});

export default model('Birthdays', Birthdays, 'Birthdays');
