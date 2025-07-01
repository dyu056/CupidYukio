import dotenv from "dotenv";
dotenv.config();
import { Telegraf } from "telegraf";
import { environment } from "./config/environment";
import { handleProfilePhoto } from "./commands/profile";
import { logger } from "./utils/logger";
import connectDB from "./config/db";
import { Markup } from "telegraf";
import { handleProfileSetup } from "./handlers/profile-setup.handler";
import { handleProfileView } from "./handlers/profile.handler";
import {
  handleProfileUpdate,
  handleUpdateField,
} from "./handlers/profile-update.handler";
import { handleQuestionSelection } from "./handlers/question-selection.handler";
import { mongoSession } from "./middlewares/session.middleware";
import {
  handleStartCommand,
  handleMenuCommand,
} from "./handlers/command.handler";
import {
  handleBrowseMatches,
  handleBrowseAction,
} from "./handlers/browse.handler";
import { handleViewMatches, handleUnmatch } from "./handlers/match.handler";

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
    // Command handlers
    this.bot.command("start", handleStartCommand);
    this.bot.command("menu", handleMenuCommand);

    // Handle Start Profile Setup button
    this.bot.hears("Start Profile Setup 🎯", async (ctx) => {
      if (!ctx.from) return;
      return handleProfileSetup(ctx);
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

    // Handle question selection flow
    this.bot.on("text", async (ctx, next) => {
      if (ctx.session.questionSelection) {
        return handleQuestionSelection(ctx);
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
    this.bot.hears("My Matches 💕", handleViewMatches);
    // Browse matches handling
    this.bot.hears("Browse Matches 👥", handleBrowseMatches);
    this.bot.hears("Continue Browsing 👥", handleBrowseMatches);
    this.bot.hears(
      ["👍 Like", "👎 Skip", "Stop Browsing 🔚"],
      handleBrowseAction
    );

    // Handle profile update options
    this.bot.hears(
      [
        "Name 📛",
        "Age ⌛",
        "Gender ⚧",
        "Questions ❓",
        "Photo 📸",
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

    // Handle unmatch callback
    this.bot.action(/^unmatch:(.+)$/, async (ctx) => {
      const matchId = ctx.match[1];
      await handleUnmatch(ctx, matchId);
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

      // Setup menu commands
      await this.setupMenuCommand();

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

  private async setupMenuCommand() {
    // Set up persistent menu command
    await this.bot.telegram.setMyCommands([
      { command: "start", description: "Start the bot" },
      { command: "menu", description: "Show main menu" },
    ]);
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
