import mongoose from "mongoose";
import { environment } from "@/config/environment";
import { logger } from "@/utils/logger";
export const connectDB = async (): Promise<void> => {
  try {
    const url = environment.MONGODB_URI;
    if (!url) {
      throw new Error("Database URL is not set");
    }

    const conn = await mongoose.connect(url!);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

// Handling connection events
mongoose.connection.on("disconnected", () => {
  logger.info("MongoDB disconnected");
});

mongoose.connection.on("error", (err) => {
  logger.error("MongoDB connection error:", err);
});

export default connectDB;
