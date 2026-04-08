import { Schema, model, Document } from 'mongoose';
import { User, UserType } from '../../types/index.js';

export interface UserDocument extends User, Document {
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String },
    password: { type: String, required: true },
    type: { type: String, enum: Object.values(UserType), required: true },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<UserDocument>('User', userSchema);
