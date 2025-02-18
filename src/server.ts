import dotenv from "dotenv";
dotenv.config();
import { Telegraf } from "telegraf";
import { environment } from "./config/environment";
import connectDB from "./config/db";
import { logger } from "./utils/logger";

const initApp = async () => {
  await connectDB();

  const bot = new Telegraf(environment.TELEGRAM_BOT_TOKEN);

  // Basic error handling
  bot.catch((err, ctx) => {
    logger.error(`Error for ${ctx.updateType}:`, err);
  });

  // Start command
  bot.command("start", async (ctx) => {
    await ctx.reply(
      "Welcome to the Dating Bot! 💝\nUse /help to see available commands."
    );
  });

  // Help command
  bot.command("help", async (ctx) => {
    await ctx.reply(
      "Available commands:\n" +
        "/start - Start the bot\n" +
        "/profile - Create or update your profile\n" +
        "/browse - Browse other profiles\n" +
        "/matches - View your matches"
    );
  });

  // Launch bot
  bot
    .launch()
    .then(() => logger.success("Bot is running"))
    .catch((error) => logger.error("Bot launch error:", error));

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
};

initApp();
