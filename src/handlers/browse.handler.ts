import { Context, Markup } from "telegraf";
import { User } from "../models/user.model";
import { logger } from "../utils/logger";

const DAILY_SWIPE_LIMIT = 50;
const BATCH_SIZE = 20;

export async function handleBrowseMatches(ctx: Context) {
  if (!ctx.from) return;

  try {
    // Get current user's profile
    const currentUser = await User.findOne({ telegramId: ctx.from.id });
    if (!currentUser) {
      return await ctx.reply("Please set up your profile first!");
    }

    // Initialize browsing session if not exists
    if (!ctx.session.browsing) {
      ctx.session.browsing = {
        matches: [], // Will store batch of potential matches
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

    // Check daily limit
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
    const matches = ctx.session.browsing.matches;

    // Reset matches if it's an array of strings (old format)
    if (
      Array.isArray(matches) &&
      matches.length > 0 &&
      typeof matches[0] === "string"
    ) {
      ctx.session.browsing.matches = [];
    }

    if (matches.length === 0) {
      const potentialMatches = await User.find({
        telegramId: { $ne: ctx.from.id },
        _id: {
          $nin: [
            ...(currentUser.likes || []),
            ...(currentUser.seenProfiles || []),
          ],
        },
        isOnboarded: true,
        gender: currentUser.gender === "male" ? "female" : "male",
      })
        .limit(BATCH_SIZE)
        .select("name age about interests photoUrl _id telegramId")
        .lean()
        .exec();

      if (potentialMatches.length === 0) {
        return await ctx.reply(
          "🔍 No more profiles to show right now!\nCheck back later for new matches.",
          Markup.keyboard([
            ["My Profile 👤", "My Matches 💕"],
            ["Update Profile ✏️"],
          ]).resize()
        );
      }

      ctx.session.browsing.matches = potentialMatches as any;
    }

    // Get next match from the session
    const potentialMatch = ctx.session.browsing.matches[0];

    // Create profile card
    const profileText = [
      `*${potentialMatch.name}*, ${potentialMatch.age}`,
      "",
      potentialMatch.about ? `_${potentialMatch.about}_\n` : "",
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

    // Update session with current match
    ctx.session.browsing.currentMatchId = potentialMatch._id;
  } catch (error) {
    logger.error("Error in browse matches:", error);
    await ctx.reply("Sorry, something went wrong. Please try again later.");
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
        // Add to seen profiles
        await User.findOneAndUpdate(
          { telegramId: ctx.from.id },
          {
            $addToSet: {
              seenProfiles: ctx.session.browsing.currentMatchId,
            },
          }
        );

        // Increment swipe counter
        ctx.session.browsing.dailySwipes++;

        if (action === "👍 Like") {
          // Add to likes
          const currentUser = await User.findOneAndUpdate(
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
            if (!currentUser) return;

            // Add users to each other's matches
            await Promise.all([
              User.findByIdAndUpdate(currentUser._id, {
                $addToSet: { matches: likedUser._id },
              }),
              User.findByIdAndUpdate(likedUser._id, {
                $addToSet: { matches: currentUser._id },
              }),
            ]);

            // Remove current match from session
            ctx.session.browsing.matches.shift();

            return await ctx.reply(
              "It's a match! 🎉\nYou can find them in your matches.",
              Markup.keyboard([
                ["My Matches 💕", "Continue Browsing 👥"],
                ["Stop Browsing 🔚"],
              ]).resize()
            );
          }
        }

        // Remove current match from session
        ctx.session.browsing.matches.shift();

        // Check if current batch is finished
        if (ctx.session.browsing.matches.length === 0) {
          return await ctx.reply(
            "You've seen all profiles in this batch! Want to see more?",
            Markup.keyboard([
              ["Browse More 🔄", "My Matches 💕"],
              ["Stop Browsing 🔚"],
            ]).resize()
          );
        }
        break;

      case "Browse More 🔄":
        // Reset matches array to trigger new batch fetch
        ctx.session.browsing.matches = [];
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
