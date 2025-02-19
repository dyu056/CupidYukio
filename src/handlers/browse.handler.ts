import { Context, Markup } from "telegraf";
import { User } from "../models/user.model";
import { logger } from "../utils/logger";

const DAILY_SWIPE_LIMIT = 50;
const BATCH_SIZE = 20;

export async function handleBrowseMatches(ctx: Context) {
  try {
    if (!ctx.from) return;

    // Get current user
    const currentUser = await User.findOne({ telegramId: ctx.from.id });
    if (!currentUser) {
      return await ctx.reply("Please set up your profile first using /start");
    }

    // Check daily limit
    if (!ctx.session.browsing) {
      ctx.session.browsing = {
        matches: [],
        dailySwipes: 0,
        lastSwipeDate: new Date().toISOString().split("T")[0],
        currentMatchId: "",
      };
    }

    // Reset daily swipes if it's a new day
    const today = new Date().toISOString().split("T")[0];
    if (ctx.session.browsing.lastSwipeDate !== today) {
      ctx.session.browsing.dailySwipes = 0;
      ctx.session.browsing.lastSwipeDate = today;
    }

    // Check if user has reached daily limit
    if (ctx.session.browsing.dailySwipes >= DAILY_SWIPE_LIMIT) {
      return await ctx.reply(
        "You've reached your daily limit of 50 swipes. Come back tomorrow! ✨",
        Markup.keyboard([
          ["My Profile 👤", "My Matches 💕"],
          ["Update Profile ✏️"],
        ]).resize()
      );
    }

    // If no matches in session or all matches viewed, fetch new batch
    if (ctx.session.browsing.matches.length === 0) {
      const potentialMatches = await User.find({
        telegramId: { $ne: ctx.from.id },
        _id: { $nin: currentUser.likes },
        isOnboarded: true,
        gender: currentUser.gender === "male" ? "female" : "male",
      })
        .limit(BATCH_SIZE)
        .select("_id");

      if (potentialMatches.length === 0) {
        return await ctx.reply(
          "No more matches available right now. Check back later! ✨",
          Markup.keyboard([
            ["My Profile 👤", "My Matches 💕"],
            ["Update Profile ✏️"],
          ]).resize()
        );
      }

      ctx.session.browsing.matches = potentialMatches.map(
        (match) => match._id?.toString() ?? ""
      );
    }

    // Get next match from the session
    const nextMatchId = ctx.session.browsing.matches[0];
    const potentialMatch = await User.findById(nextMatchId);

    if (!potentialMatch) {
      // Remove invalid match and try again
      ctx.session.browsing.matches.shift();
      return handleBrowseMatches(ctx);
    }

    // Create profile card
    const profileText = [
      `*${potentialMatch.name}*, ${potentialMatch.age}`,
      "",
      `*Interests:* ${
        potentialMatch.interests?.length
          ? potentialMatch.interests.join(", ")
          : "No interests added"
      }`,
      "",
      `Swipes today: ${ctx.session.browsing.dailySwipes}/${DAILY_SWIPE_LIMIT}`,
    ].join("\n");

    // Show profile with like/skip buttons
    if (potentialMatch.photoUrl) {
      await ctx.replyWithPhoto(potentialMatch.photoUrl, {
        caption: profileText,
        parse_mode: "Markdown",
        ...Markup.keyboard([
          ["👍 Like", "👎 Skip"],
          ["Stop Browsing 🔚"],
        ]).resize(),
      });
    } else {
      await ctx.reply(profileText, {
        parse_mode: "Markdown",
        ...Markup.keyboard([
          ["👍 Like", "👎 Skip"],
          ["Stop Browsing 🔚"],
        ]).resize(),
      });
    }

    // Update session
    ctx.session.browsing.currentMatchId = nextMatchId;
  } catch (error) {
    logger.error("Error in browse matches:", error);
    await ctx.reply("Sorry, there was an error. Please try again.");
  }
}

export async function handleBrowseAction(ctx: Context) {
  try {
    if (!ctx.from || !ctx.message || !("text" in ctx.message)) return;
    if (!ctx.session.browsing?.currentMatchId) {
      return await ctx.reply("Please start browsing first!");
    }

    const action = ctx.message.text;

    switch (action) {
      case "👍 Like":
      case "👎 Skip":
        // Increment swipe counter
        ctx.session.browsing.dailySwipes++;

        if (action === "👍 Like") {
          // Add to likes
          await User.findOneAndUpdate(
            { telegramId: ctx.from.id },
            { $addToSet: { likes: ctx.session.browsing.currentMatchId } }
          );

          // Check if it's a match
          const likedUser = await User.findById(
            ctx.session.browsing.currentMatchId
          ).populate("likes", "telegramId");
          if (
            likedUser?.likes.some(
              (like) => (like as any).telegramId === ctx.from?.id
            )
          ) {
            await ctx.reply(
              "It's a match! 🎉\nYou can find them in your matches.",
              Markup.keyboard([
                ["My Matches 💕", "Continue Browsing 👥"],
                ["Stop Browsing 🔚"],
              ]).resize()
            );
            // Remove current match from session
            ctx.session.browsing.matches.shift();
            return;
          }
        }

        // Remove current match from session
        ctx.session.browsing.matches.shift();
        break;

      case "Stop Browsing 🔚":
        delete ctx.session.browsing;
        return await ctx.reply(
          "Stopped browsing. What would you like to do?",
          Markup.keyboard([
            ["My Profile 👤", "Browse Matches 👥"],
            ["My Matches 💕", "Update Profile ✏️"],
          ]).resize()
        );

      default:
        return;
    }

    // Show next match
    return handleBrowseMatches(ctx);
  } catch (error) {
    logger.error("Error handling browse action:", error);
    await ctx.reply("Sorry, there was an error. Please try again.");
  }
}
