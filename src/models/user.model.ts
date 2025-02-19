import mongoose, { Document, Schema } from "mongoose";
import { Match } from "./match.model";

export interface IUser extends Document {
  telegramId: number;
  name: string;
  age?: string;
  username: string;
  gender?: "male" | "female" | "other";
  photoUrl?: string;
  interests: string[];
  likes: number[];
  matches: mongoose.Types.ObjectId[];
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
    likes: [{ type: Number }],
    matches: [
      {
        type: Schema.Types.ObjectId,
        ref: "Match",
      },
    ],
  },
  { timestamps: true }
);

userSchema.index({ username: 1 }, { unique: true });

userSchema.methods.getActiveMatches = function () {
  return Match.find({
    users: this._id,
    status: "active",
  }).populate("users", "name photoUrl");
};

export const User = mongoose.model<IUser>("User", userSchema);
