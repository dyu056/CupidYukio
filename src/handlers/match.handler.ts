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
        `*Interests:* ${
          match.interests?.length
            ? match.interests.join(", ")
            : "No interests added"
        }`,
        "",
        `[Send Message 💌](https://t.me/${match.username})`,
      ].join("\n");

      const removeButton = Markup.inlineKeyboard([
        Markup.button.callback("Remove Match ❌", `unmatch:${match._id}`),
      ]).reply_markup;

      if (match.photoUrl) {
        await ctx.replyWithPhoto(match.photoUrl, {
          caption: matchText,
          parse_mode: "Markdown",
          has_spoiler: true,
          reply_markup: removeButton,
        });
      } else {
        await ctx.reply(matchText, {
          parse_mode: "Markdown",
          link_preview_options: { is_disabled: true },
          reply_markup: removeButton,
        });
      }
    }

    // await ctx.reply(
    //   "What would you like to do next?",
    //   Markup.keyboard([
    //     ["My Profile 👤", "Browse Matches 👥"],
    //     ["My Matches 💕", "Update Profile ✏️"],
    //   ]).resize()
    // );
  } catch (error) {
    logger.error("Error viewing matches:", error);
    await ctx.reply("Sorry, there was an error. Please try again.");
  }
}

export async function handleUnmatch(ctx: Context, matchId: string) {
  try {
    if (!ctx.from) return;

    // Remove match from both users
    await Promise.all([
      User.findOneAndUpdate(
        { telegramId: ctx.from.id },
        { $pull: { matches: matchId } }
      ),
      User.findByIdAndUpdate(matchId, {
        $pull: {
          matches: (await User.findOne({ telegramId: ctx.from.id }))!._id,
        },
      }),
    ]);

    await ctx.answerCbQuery("Match removed successfully!");
    await ctx.editMessageReplyMarkup({ inline_keyboard: [] });

    // Show updated matches or return to menu
    return handleViewMatches(ctx);
  } catch (error) {
    logger.error("Error removing match:", error);
    await ctx.answerCbQuery("Failed to remove match. Please try again.");
  }
}
