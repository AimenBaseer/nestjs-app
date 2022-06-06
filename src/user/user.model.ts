import * as mongoose from 'mongoose';

export enum Role {
  client = 'client',
  advisor = 'advisor',
}

export const UserSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  email: { type: String, required: true },
  type: { type: String, required: true, enum: [Role.advisor, Role.client] },
  password: { type: String, required: true },
  phone: { type: String },
  status_id: { type: String, required: true },
});

export interface User {
  _id?: string;
  firstname: string;
  lastname: string;
  email: string;
  type: Role;
  password: string;
  phone: string;
  status_id: string;
}
