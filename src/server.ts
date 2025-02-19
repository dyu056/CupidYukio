import dotenv from "dotenv";
dotenv.config();
import { Telegraf } from "telegraf";
import { environment } from "./config/environment";
import { handleProfilePhoto } from "./commands/profile";
import { logger } from "./utils/logger";
import connectDB from "./config/db";
import { userService } from "./services/user.service";
import { Markup } from "telegraf";
import { handleProfileSetup } from "./handlers/profile-setup.handler";
import { handleProfileView } from "./handlers/profile.handler";
import {
  handleProfileUpdate,
  handleUpdateField,
} from "./handlers/profile-update.handler";
import { mongoSession } from "./middleware/session.middleware";
import { User } from "./models/user.model";

export class TelegramBot {
  private bot: Telegraf;
  private isShuttingDown = false;

  constructor() {
    this.bot = new Telegraf(environment.TELEGRAM_BOT_TOKEN);
    this.setupMiddleware();
    this.setupCommands();
    this.setupMenuCommand();
    this.setupErrorHandling();
  }

  private setupMiddleware(): void {
    // Enable MongoDB session handling
    this.bot.use(mongoSession);

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
    // Handle all commands first
    this.bot.on("text", async (ctx, next) => {
      const text = ctx.message.text;
      if (!text.startsWith("/")) return next();

      // Handle /start command
      if (text === "/start") {
        // Prevent duplicate handling
        if (ctx.session?.handledStart) return next();
        ctx.session = { ...ctx.session, handledStart: true };

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
            // Clear the flag after a short delay
            setTimeout(() => {
              if (ctx.session) delete ctx.session.handledStart;
            }, 1000);
            return;
          }

          await ctx.reply(
            "Welcome back! \n" + "What would you like to do?",
            Markup.keyboard([
              ["My Profile 👤", "Browse Matches 👥"],
              ["My Matches 💕", "Update Profile ✏️"],
            ]).resize()
          );
          // Clear the flag after a short delay
          setTimeout(() => {
            if (ctx.session) delete ctx.session.handledStart;
          }, 1000);
          return;
        } catch (error) {
          logger.error("Error in start command:", error);
          await ctx.reply("Sorry, something went wrong. Please try again.");
          return;
        }
      }

      // Handle /menu command
      if (text === "/menu") {
        await ctx.reply(
          "What would you like to do?",
          Markup.keyboard([
            ["My Profile 👤", "Browse Matches 👥"],
            ["My Matches 💕", "Update Profile ✏️"],
          ]).resize()
        );
        return;
      }

      // Handle /help command
      if (text === "/help") {
        logger.info(`User ${ctx.from?.id} requested help`);
        await ctx.reply(
          "Available commands:\n\n" +
            "/start - Start the bot\n" +
            "/menu - Show main menu\n" +
            "/help - Show this help message"
        );
        return;
      }

      // Unknown commands
      logger.warning(`Unknown command attempted: ${text}`);
      await ctx.reply("Unknown command. Use /help to see available commands.");
    });

    // Handle button responses
    this.bot.hears("Start Profile Setup 🎯", async (ctx) => {
      if (!ctx.from) return;
      const user = await User.findOne({ telegramId: ctx.from.id });
      if (!user?.isOnboarded) {
        return handleProfileSetup(ctx);
      }
      return ctx.reply(
        "Your profile is already set up! You can update it using the Update Profile button.",
        Markup.keyboard([
          ["My Profile 👤", "Browse Matches 👥"],
          ["My Matches 💕", "Update Profile ✏️"],
        ]).resize()
      );
    });

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

    // Profile view handling
    this.bot.command("profile", handleProfileView);
    this.bot.hears("My Profile 👤", handleProfileView);
    this.bot.hears("Update Profile ✏️", handleProfileUpdate);
    this.bot.hears("My Matches 💕", async (ctx) => {
      // TODO: Implement matches view
      await ctx.reply("Coming soon: View your matches!");
    });
    this.bot.hears("Browse Matches 👥", async (ctx) => {
      // TODO: Implement browse matches
      await ctx.reply("Coming soon: Browse potential matches!");
    });

    // Handle profile update options
    this.bot.hears(
      [
        "Name 📛",
        "Age ⌛",
        "Gender ⚧",
        "Photo 📸",
        "Interests 🎯",
        "Cancel ❌",
      ],
      handleUpdateField
    );

    // Handle update values
    this.bot.on(["text", "photo"], async (ctx, next) => {
      if (ctx.session?.updateField) {
        if (ctx.session.updateField === "photo" && "photo" in ctx.message) {
          await handleProfilePhoto(ctx);
          delete ctx.session.updateField;
          await ctx.reply(
            "Profile photo updated successfully! ✨",
            Markup.keyboard([
              ["My Profile 👤", "Browse Matches 👥"],
              ["My Matches 💕", "Update Profile ✏️"],
            ]).resize()
          );
        } else if ("text" in ctx.message) {
          return handleUpdateField(ctx);
        }
      }
      return next();
    });
  }

  private async setupMenuCommand() {
    // Set up persistent menu command
    await this.bot.telegram.setMyCommands([
      { command: "start", description: "Start the bot" },
      { command: "menu", description: "Show main menu" },
      { command: "help", description: "Show help" },
    ]);
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
