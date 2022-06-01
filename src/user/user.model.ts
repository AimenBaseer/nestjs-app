import * as mongoose from 'mongoose';

export enum Type {
  client = 'client',
  advisor = 'advisor',
}

export const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  type: { type: String, required: true, enum: [Type.advisor, Type.client] },
  password: { type: String, required: true },
  phone: { type: String },
  status_id: { type: Number, required: true },
});

export interface IUser {
  _id?: string;
  name: string;
  email: string;
  type: Type;
  password: string;
  phone: string;
  status_id: number;
}
