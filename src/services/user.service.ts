import { User, IUser } from "../models/user.model";
import { logger } from "../utils/logger";

export class UserService {
  async findOrCreateUser(telegramData: {
    id: number;
    first_name: string;
    username?: string;
  }): Promise<{ user: IUser; isNew: boolean }> {
    try {
      const existingUser = await User.findOne({ telegramId: telegramData.id });

      if (existingUser) {
        return { user: existingUser, isNew: false };
      }

      const newUser = await User.create({
        telegramId: telegramData.id,
        name: telegramData.first_name,
        username: telegramData.username || `user_${telegramData.id}`,
        interests: [],
        likes: [],
        matches: [],
      });

      return { user: newUser, isNew: true };
    } catch (error) {
      logger.error("Error in findOrCreateUser:", error);
      throw error;
    }
  }
}

export const userService = new UserService();
