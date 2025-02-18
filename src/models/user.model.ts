import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  telegramId: number;
  name: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other";
  photoUrl?: string;
  interests: string[];
  likes: number[];
  matches: number[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    telegramId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    dateOfBirth: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    photoUrl: { type: String },
    interests: [{ type: String }],
    likes: [{ type: Number }],
    matches: [{ type: Number }],
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
