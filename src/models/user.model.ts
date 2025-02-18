import mongoose, { Document, Schema } from "mongoose";
import { Match } from "./match.model";

export interface IUser extends Document {
  telegramId: number;
  name: string;
  dateOfBirth?: string;
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
    dateOfBirth: { type: String },
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

// Add helper method to get active matches
userSchema.methods.getActiveMatches = function () {
  return Match.find({
    users: this._id,
    status: "active",
  }).populate("users", "name photoUrl");
};

export const User = mongoose.model<IUser>("User", userSchema);
