import mongoose, { Schema } from "mongoose";

const sessionSchema = new Schema(
  {
    key: { type: String, required: true, unique: true },
    data: { type: Schema.Types.Mixed, required: true },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

export const Session = mongoose.model("Session", sessionSchema);
