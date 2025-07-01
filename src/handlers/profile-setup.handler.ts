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
    case "interests":
      return handleInterestsInput(ctx);
    case "about":
      return handleAboutInput(ctx);
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

async function handleInterestsInput(ctx: Context) {
  if (!ctx.message || !ctx.from) return;
  ensureProfileSetup(ctx);
  if (!("text" in ctx.message)) return;

  if (ctx.message.text === "Done ✅") {
    if (!ctx.session.profileSetup.data.interests?.length) {
      return await ctx.reply(
        "Please add at least one interest before proceeding."
      );
    }

    ctx.session.profileSetup.step = "about";
    return await ctx.reply(
      "Time to add a catchy one-liner! 🌟\n" +
        "Share your best pickup line, a joke, or anything that makes you unique!\n" +
        "(Keep it short and sweet - max 150 characters)",
      Markup.removeKeyboard()
    );
  }

  const interests = ctx.message.text
    .split(",")
    .map((interest) => interest.trim())
    .filter((interest) => interest.length > 0);

  const currentInterests = ctx.session.profileSetup.data.interests || [];
  const updatedInterests = [...new Set([...currentInterests, ...interests])];

  if (updatedInterests.length > 5) {
    return await ctx.reply(
      "You can only have up to 5 interests. Please remove some before adding more."
    );
  }

  ctx.session.profileSetup.data.interests = updatedInterests;

  await ctx.reply(
    `Added interests: ${interests.join(", ")}\n` +
      `You have ${updatedInterests.length}/5 interests.\n` +
      "You can add more or press 'Done ✅' to continue."
  );
}

async function handleAboutInput(ctx: Context) {
  if (!ctx.message || !ctx.from) return;
  ensureProfileSetup(ctx);
  if (!("text" in ctx.message)) return;

  const about = ctx.message.text.trim();

  // Validate about length
  // if (about.length > 150) {
  //   return await ctx.reply(
  //     "That's a bit too long! Please keep it under 150 characters. Try again!"
  //   );
  // }

  ctx.session.profileSetup.data.about = about;
  ctx.session.profileSetup.step = "photo";

  await ctx.reply(
    "Great one-liner! 🎯\nNow, send me a photo of yourself (Max 1 photo).",
    Markup.removeKeyboard()
  );
}

async function handlePhotoInput(ctx: Context) {
  if (!ctx.message || !ctx.from) return;
  ensureProfileSetup(ctx);
  if (!("photo" in ctx.message)) {
    return await ctx.reply("Please send a photo.");
  }

  try {
    // Save all profile data including about and questions
    try {
      await profileService.updateProfile(ctx.from.id, {
        age: ctx.session.profileSetup.data.age,
        gender: ctx.session.profileSetup.data.gender,
        questions: ctx.session.profileSetup.data.questions,
        interests: ctx.session.profileSetup.data.interests,
        about: ctx.session.profileSetup.data.about,
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
