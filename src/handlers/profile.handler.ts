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
      return question ? question.text : questionId;
    }) || [];

    // Create basic profile card message (without questions)
    const profileText = [
      "👤 *Your Profile*",
      "",
      `*Name:* ${user.name}`,
      `*Age:* ${user.age || "Not set"}`,
      `*Gender:* ${user.gender ? user.gender.charAt(0).toUpperCase() + user.gender.slice(1) : "Not set"}`,
      "",
      `*Selected Questions:* ${questionTexts.length} question${questionTexts.length !== 1 ? 's' : ''}`,
    ].join("\n");

    // Send profile with photo if available
    if (user.photoUrl) {
      await ctx.replyWithPhoto(user.photoUrl, {
        caption: profileText,
        parse_mode: "Markdown",
      });
    } else {
      await ctx.reply(profileText, {
        parse_mode: "Markdown",
      });
    }

    // Send each question as a separate message
    if (questionTexts.length > 0) {
      for (let i = 0; i < questionTexts.length; i++) {
        const questionText = questionTexts[i];
        await ctx.reply(
          `*Question ${i + 1}:*\n${questionText}`,
          { parse_mode: "Markdown" }
        );
      }
    } else {
      await ctx.reply("No questions selected");
    }

    // Send the main menu keyboard after all questions
    await ctx.reply(
      "What would you like to do next?",
      Markup.keyboard([
        ["My Profile 👤", "Browse Matches 👥"],
        ["My Matches 💕", "Update Profile ✏️"],
      ]).resize()
    );

  } catch (error) {
    logger.error("Error displaying profile:", error);
    await ctx.reply("Sorry, there was an error displaying your profile.");
  }
}
