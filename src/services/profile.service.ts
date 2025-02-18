import { User, IUser } from "../models/user.model";
import { logger } from "../utils/logger";
import { ProfileSetupState } from "../types/session.types";

export class ProfileService {
  async updateProfile(
    userId: number,
    data: Partial<ProfileSetupState["data"]>
  ): Promise<IUser> {
    try {
      const user = await User.findOneAndUpdate(
        { telegramId: userId },
        { $set: data },
        { new: true }
      );

      if (!user) {
        throw new Error("User not found");
      }

      return user;
    } catch (error) {
      logger.error("Error updating profile:", error);
      throw error;
    }
  }

  validateAge(age: string): boolean {
    const ageNum = parseInt(age);
    return !isNaN(ageNum) && ageNum >= 15 && ageNum <= 100;
  }

  validateGender(gender: string): gender is "male" | "female" | "other" {
    return ["male", "female", "other"].includes(gender.toLowerCase());
  }
}

export const profileService = new ProfileService();
