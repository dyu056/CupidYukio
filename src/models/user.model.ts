import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  telegramId: number;
  name: string;
  age?: string;
  username: string;
  gender?: "male" | "female" | "other";
  photoUrl?: string;
  interests: string[];
  likes: mongoose.Types.ObjectId[];
  matches: mongoose.Types.ObjectId[];
  isOnboarded: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    telegramId: { type: Number, required: true, unique: true },
    name: { type: String, required: true },
    username: { type: String, required: true },
    age: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    photoUrl: { type: String },
    interests: [{ type: String }],
    likes: [{ type: Schema.Types.ObjectId, ref: "User" }],
    matches: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isOnboarded: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.index({ username: 1 }, { unique: true });

export const User = mongoose.model<IUser>("User", userSchema);
