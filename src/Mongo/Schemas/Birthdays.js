import { Schema, model } from 'mongoose';

const Birthdays = new Schema({
  userId: { type: String, unique: true },
  date: String,
  lastRun: String
});

export default model('Birthdays', Birthdays, 'Birthdays');
