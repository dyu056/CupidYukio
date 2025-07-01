import { Context, Markup } from "telegraf";
import { User } from "../models/user.model";
import { logger } from "../utils/logger";
import { questions } from "../data/questions";

export async function handleProfileView(ctx: Context) {
  if (!ctx.from) return;

  try {
    const user = await User.findOne({ telegramId: ctx.from.id });
    if (!user) {
      return await ctx.reply(
        "Profile not found. Please use /start to create your profile."
      );
    }

    // Get question texts from question IDs
    const questionTexts = user.questions?.map(questionId => {
      const question = questions.find(q => q.id === questionId);
      return question ? question.text.substring(0, 50) + (question.text.length > 50 ? '...' : '') : questionId;
    }) || [];

    // Create profile card message
    const profileText = [
      "👤 *Your Profile*",
      "",
      `*Name:* ${user.name}`,
      `*Age:* ${user.age || "Not set"}`,
      `*Gender:* ${user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "Not set"}`,
      "",
      user.about ? `*About:* _${user.about}_\n` : "",
      "*Selected Questions:*",
      questionTexts.length
        ? questionTexts.map((text, index) => `• ${text}`).join("\n")
        : "No questions selected",
      "",
      "*Interests:*",
      user.interests?.length
        ? user.interests.map((interest) => `• ${interest}`).join("\n")
        : "No interests added",
    ].join("\n");

    // If user has a photo, send it with the profile text
    if (user.photoUrl) {
      await ctx.replyWithPhoto(user.photoUrl, {
        caption: profileText,
        parse_mode: "Markdown",
        ...Markup.keyboard([
          ["My Profile 👤", "Browse Matches 👥"],
          ["My Matches 💕", "Update Profile ✏️"],
        ]).resize(),
      });
    } else {
      await ctx.reply(profileText, {
        parse_mode: "Markdown",
        ...Markup.keyboard([
          ["My Profile 👤", "Browse Matches 👥"],
          ["My Matches 💕", "Update Profile ✏️"],
        ]).resize(),
      });
    }
  } catch (error) {
    logger.error("Error displaying profile:", error);
    await ctx.reply("Sorry, there was an error displaying your profile.");
  }
}
