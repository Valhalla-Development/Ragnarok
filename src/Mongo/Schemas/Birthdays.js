import { Schema, model } from 'mongoose';

const Birthdays = new Schema({
  UserId: { type: String, unique: true },
  Date: { type: String, default: null },
  LastRun: { type: Array, default: [] }
});

export default model('Birthdays', Birthdays, 'Birthdays');
