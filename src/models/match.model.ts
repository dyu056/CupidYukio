import mongoose, { Document, Schema } from "mongoose";

export interface IMatch extends Document {
  users: [mongoose.Types.ObjectId, mongoose.Types.ObjectId]; // Array of exactly 2 users
  matchedAt: Date;
  lastInteractionAt: Date;
  status: "active" | "archived" | "blocked";
  initiatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const matchSchema = new Schema<IMatch>(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    matchedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    lastInteractionAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["active", "archived", "blocked"],
      default: "active",
      required: true,
    },
    initiatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure exactly 2 users in the match
matchSchema.pre("save", function (next) {
  if (this.users.length !== 2) {
    next(new Error("A match must have exactly 2 users"));
  } else {
    next();
  }
});

// Ensure users are different
matchSchema.pre("save", function (next) {
  if (this.users[0].equals(this.users[1])) {
    next(new Error("Cannot match a user with themselves"));
  } else {
    next();
  }
});

// Index for efficient querying
matchSchema.index({ users: 1 });
matchSchema.index({ status: 1 });
matchSchema.index({ matchedAt: -1 });

// Static method to find matches for a user
matchSchema.statics.findUserMatches = function (
  userId: mongoose.Types.ObjectId
) {
  return this.find({
    users: userId,
    status: "active",
  }).populate("users", "name photoUrl");
};

// Method to archive match
matchSchema.methods.archiveMatch = async function () {
  this.status = "archived";
  this.lastInteractionAt = new Date();
  await this.save();
};

export const Match = mongoose.model<IMatch>("Match", matchSchema);
