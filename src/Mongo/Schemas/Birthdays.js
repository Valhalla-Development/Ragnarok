import { Schema, model } from 'mongoose';

const Birthdays = new Schema({
  UserId: { type: String, unique: true },
  Date: String,
  LastRun: String
});

export default model('Birthdays', Birthdays, 'Birthdays');
