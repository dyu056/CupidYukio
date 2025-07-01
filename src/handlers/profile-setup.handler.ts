import { Context, Markup } from "telegraf";
import { profileService } from "../services/profile.service";
import { logger } from "../utils/logger";
import { ProfileSetupState } from "../types/session.types";
import { handleProfilePhoto } from "../commands/profile";
import { handleQuestionSelection, startQuestionSelection } from "./question-selection.handler";

export async function handleProfileSetup(ctx: Context) {
  if (!ctx.message || !ctx.from) return;
  ensureProfileSetup(ctx);

  const { step } = ctx.session.profileSetup;

  switch (step) {
    case "age":
      return handleAgeInput(ctx);
    case "gender":
      return handleGenderInput(ctx);
    case "questions":
      return handleQuestionSelection(ctx);
    case "photo":
      return handlePhotoInput(ctx);
    default:
      return startProfileSetup(ctx);
  }
}

async function startProfileSetup(ctx: Context) {
  ctx.session.profileSetup = {
    step: "age",
    data: {},
  };

  await ctx.reply(
    "Let's create your profile! 📝\n\n" + "First, what's your age?",
    Markup.removeKeyboard()
  );
}

function ensureProfileSetup(
  ctx: Context
): asserts ctx is Context & { session: { profileSetup: ProfileSetupState } } {
  if (!ctx.session?.profileSetup) {
    ctx.session = {
      ...ctx.session,
      profileSetup: {
        step: "age",
        data: {},
      },
    };
  }
}

async function handleAgeInput(ctx: Context) {
  if (!ctx.message || !ctx.from) return;
  ensureProfileSetup(ctx);
  if (!("text" in ctx.message)) {
    return await ctx.reply("Please enter your age as a number.");
  }

  const age = ctx.message.text;

  if (!profileService.validateAge(age)) {
    return await ctx.reply("Please enter your age(only 15-100).");
  }

  ctx.session.profileSetup.step = "gender";
  ctx.session.profileSetup.data.age = age;

  await ctx.reply(
    "Great! Now, what's your gender?",
    Markup.keyboard([["Male 👨", "Female 👩"], ["Other 🌈"]]).resize()
  );
}

async function handleGenderInput(ctx: Context) {
  if (!ctx.message || !ctx.from) return;
  ensureProfileSetup(ctx);
  if (!("text" in ctx.message)) return;

  const genderInput = ctx.message.text.toLowerCase().replace(/[^a-zA-Z]/g, "");

  if (!profileService.validateGender(genderInput)) {
    return await ctx.reply(
      "Please select a gender using the buttons provided."
    );
  }

  ctx.session.profileSetup.step = "questions";
  ctx.session.profileSetup.data.gender = genderInput;

  // Start question selection
  return await startQuestionSelection(ctx);
}

async function handlePhotoInput(ctx: Context) {
  if (!ctx.message || !ctx.from) return;
  ensureProfileSetup(ctx);
  if (!("photo" in ctx.message)) {
    return await ctx.reply("Please send a photo.");
  }

  try {
    // Save all profile data
    try {
      await profileService.updateProfile(ctx.from.id, {
        age: ctx.session.profileSetup.data.age,
        gender: ctx.session.profileSetup.data.gender,
        questions: ctx.session.profileSetup.data.questions,
      });
    } catch (error) {
      logger.error("Error updating profile:", error);
      return await ctx.reply("Sorry, there was an error. Please try again.");
    }

    await handleProfilePhoto(ctx);
    ctx.session.profileSetup.step = "complete";

    await ctx.reply(
      "Perfect! Your profile is now complete. 🎉\n" +
        "What would you like to do next?",
      Markup.keyboard([
        ["My Profile 👤", "Browse Matches 👥"],
        ["My Matches 💕", "Update Profile ✏️"],
      ]).resize()
    );
  } catch (error) {
    logger.error("Error saving photo:", error);
    await ctx.reply(
      "Sorry, there was an error saving your photo. Please try again."
    );
  }
}
