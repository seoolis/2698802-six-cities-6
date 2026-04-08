import { Schema, Document, model } from 'mongoose';
import { User, UserType } from '../../types/index.js';

export interface UserDocument extends User, Document {
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      unique: true,
      required: true,
      match: [/^\S+@\S+\.\S+$/, 'Email is incorrect'],
    },

    name: {
      type: String,
      required: true,
      minlength: [2, 'Min length for name is 2'],
    },

    avatar: {
      type: String,
      required: false,
    },

    password: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      enum: Object.values(UserType),
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<UserDocument>('User', userSchema);
