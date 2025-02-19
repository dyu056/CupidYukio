import { Context, Markup } from "telegraf";
import { User } from "../models/user.model";
import { logger } from "../utils/logger";

export async function handleViewMatches(ctx: Context) {
  try {
    if (!ctx.from) return;

    const user = await User.findOne({ telegramId: ctx.from.id }).populate({
      path: "matches",
      select: "name age photoUrl telegramId username interests",
    });

    if (!user?.matches.length) {
      return await ctx.reply(
        "You don't have any matches yet. Keep browsing! ✨",
        Markup.keyboard([
          ["My Profile 👤", "Browse Matches 👥"],
          ["Update Profile ✏️"],
        ]).resize()
      );
    }

    // Send each match as a separate message
    for (const matchInfo of user.matches) {
      const match = matchInfo as any;

      const matchedUser = match?.telegramId !== ctx.from?.id;
      if (!matchedUser) continue;

      const matchText = [
        `*${match.name}*, ${match.age}`,
        "",
        "Send them a message to start chatting! 💌",
      ].join("\n");

      if (match.photoUrl) {
        await ctx.replyWithPhoto(match.photoUrl, {
          caption: matchText,
          parse_mode: "Markdown",
        });
      } else {
        await ctx.reply(matchText, { parse_mode: "Markdown" });
      }
    }

    await ctx.reply(
      "What would you like to do next?",
      Markup.keyboard([
        ["My Profile 👤", "Browse Matches 👥"],
        ["My Matches 💕", "Update Profile ✏️"],
      ]).resize()
    );
  } catch (error) {
    logger.error("Error viewing matches:", error);
    await ctx.reply("Sorry, there was an error. Please try again.");
  }
}
