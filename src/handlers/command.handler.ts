import { Context, Markup } from "telegraf";
import { userService } from "../services/user.service";
import { logger } from "../utils/logger";

export async function handleStartCommand(ctx: Context) {
  try {
    if (!ctx.from) return;

    const { user, isNew } = await userService.findOrCreateUser(ctx.from);

    if (!user.isOnboarded) {
      await ctx.reply(
        "Welcome to the Dating Bot! 💝\n" +
          "I'll help you find your perfect match.",
        Markup.keyboard([
          [Markup.button.text("Start Profile Setup 🎯")],
        ]).resize()
      );
      return;
    }

    await ctx.reply(
      "Welcome back! What would you like to do?",
      Markup.keyboard([
        ["My Profile 👤", "Browse Matches 👥"],
        ["My Matches 💕", "Update Profile ✏️"],
      ]).resize()
    );
  } catch (error) {
    logger.error("Error in start command:", error);
    await ctx.reply("Sorry, something went wrong. Please try again.");
  }
}

export async function handleMenuCommand(ctx: Context) {
  await ctx.reply(
    "What would you like to do?",
    Markup.keyboard([
      ["My Profile 👤", "Browse Matches 👥"],
      ["My Matches 💕", "Update Profile ✏️"],
    ]).resize()
  );
}
