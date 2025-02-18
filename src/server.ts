import dotenv from "dotenv";
dotenv.config();
import { Telegraf, session } from "telegraf";
import { environment } from "./config/environment";
import { handleProfilePhoto } from "./commands/profile";
import { logger } from "./utils/logger";
import connectDB from "./config/db";
import { userService } from "./services/user.service";
import { Markup } from "telegraf";
import { handleProfileSetup } from "./handlers/profile-setup.handler";

// Load environment variables

export class TelegramBot {
  private bot: Telegraf;
  private isShuttingDown = false;

  constructor() {
    this.bot = new Telegraf(environment.TELEGRAM_BOT_TOKEN);
    this.setupMiddleware();
    this.setupCommands();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Enable session handling
    this.bot.use(session());

    // Log all updates
    if (process.env.NODE_ENV !== "production") {
      this.bot.use(async (ctx, next) => {
        const start = Date.now();
        await next();
        const ms = Date.now() - start;
        console.log(`Response time: ${ms}ms`);
      });
    }
  }

  private setupCommands(): void {
    // Start command
    this.bot.command("start", async (ctx) => {
      try {
        if (!ctx.from) {
          return;
        }

        const { user, isNew } = await userService.findOrCreateUser(ctx.from);

        if (isNew) {
          // Show welcome message with start button
          await ctx.reply(
            "Welcome to the Dating Bot! 💝\n" +
              "I'll help you find your perfect match.",
            Markup.keyboard([
              [Markup.button.text("Start Profile Setup 🎯")],
            ]).resize()
          );
        } else {
          // Existing user
          await ctx.reply(
            "Welcome back! ��\n" + "What would you like to do?",
            Markup.keyboard([
              [Markup.button.text("Update Profile ✏️")],
              [Markup.button.text("Browse Matches 👥")],
            ]).resize()
          );
        }
      } catch (error) {
        logger.error("Error in start command:", error);
        await ctx.reply("Sorry, something went wrong. Please try again.");
      }
    });

    // Handle button responses
    this.bot.hears("Start Profile Setup 🎯", handleProfileSetup);

    // Handle profile setup flow
    this.bot.on("text", async (ctx, next) => {
      if (
        ctx.session.profileSetup &&
        ctx.session.profileSetup.step !== "complete"
      ) {
        return handleProfileSetup(ctx);
      }
      return next();
    });

    // Handle photo messages in profile setup
    this.bot.on("photo", async (ctx, next) => {
      if (
        ctx.session?.profileSetup &&
        ctx.session.profileSetup.step === "photo"
      ) {
        return handleProfileSetup(ctx);
      }
      return next();
    });

    // Help command
    this.bot.command("help", async (ctx) => {
      logger.info(`User ${ctx.from?.id} requested help`);
      await ctx.reply(
        "Available commands:\n\n" +
          "/start - Start the bot\n" +
          "/profile - Create or update your profile\n" +
          "/photo - Update your profile photo\n" +
          "/browse - Browse other profiles\n" +
          "/matches - View your matches\n" +
          "/help - Show this help message"
      );
    });

    // Profile photo handling
    // this.bot.command("photo", handleProfilePhoto);
    // this.bot.on("message", (ctx, next) => {
    //   if ("photo" in ctx.message) {
    //     return handleProfilePhoto(ctx);
    //   }
    //   return next();
    // });

    // Handle unknown commands
    this.bot.on("text", async (ctx) => {
      if (ctx.message.text.startsWith("/")) {
        logger.warning(`Unknown command attempted: ${ctx.message.text}`);
        await ctx.reply(
          "Unknown command. Use /help to see available commands."
        );
      }
    });
  }

  private setupErrorHandling(): void {
    // Global error handler
    this.bot.catch((err, ctx) => {
      logger.error(`Error while handling update ${ctx.update.update_id}:`, err);

      // Notify user of error
      ctx
        .reply("Sorry, something went wrong. Please try again later.")
        .catch((e) => {
          logger.error("Error while sending error message to user:", e);
        });
    });
  }

  private setupGracefulShutdown(): void {
    const signals = ["SIGINT", "SIGTERM", "SIGQUIT"];

    signals.forEach((signal) => {
      process.on(signal, async () => {
        logger.info(`${signal} received. Starting graceful shutdown...`);

        this.isShuttingDown = true;

        try {
          // Stop accepting new requests
          await this.bot.stop();
          logger.success("Bot stopped accepting new requests");
          logger.success("Graceful shutdown completed");
          process.exit(0);
        } catch (error) {
          logger.error("Error during graceful shutdown:", error);
          process.exit(1);
        }
      });
    });
  }

  public async start(): Promise<void> {
    try {
      // Connect to database
      await connectDB();

      // Setup graceful shutdown
      this.setupGracefulShutdown();

      // Start bot
      await this.bot.launch();
      logger.success("Bot started successfully");

      // Enable graceful stop
      process.once("SIGINT", () => this.bot.stop("SIGINT"));
      process.once("SIGTERM", () => this.bot.stop("SIGTERM"));
    } catch (error) {
      logger.error("Error starting the bot:", error);
      process.exit(1);
    }
  }
}

// Create and start bot instance
if (require.main === module) {
  const bot = new TelegramBot();
  bot.start().catch((error) => {
    logger.error("Failed to start the bot:", error);
    process.exit(1);
  });
}
