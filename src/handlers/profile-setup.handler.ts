import { Context, Markup } from "telegraf";
import { profileService } from "../services/profile.service";
import { logger } from "../utils/logger";
import { ProfileSetupState } from "../types/session.types";
import { handleProfilePhoto } from "../commands/profile";

export async function handleProfileSetup(ctx: Context) {
  if (!ctx.message || !ctx.from) return;
  ensureProfileSetup(ctx);

  const { step } = ctx.session.profileSetup;

  switch (step) {
    case "age":
      return handleAgeInput(ctx);
    case "gender":
      return handleGenderInput(ctx);
    case "interests":
      return handleInterestsInput(ctx);
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
    return await ctx.reply("Please enter your age.");
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

  ctx.session.profileSetup.step = "interests";
  ctx.session.profileSetup.data.gender = genderInput;

  await ctx.reply(
    "Perfect! Now, tell me about your interests.\n" +
      "You can enter multiple interests separated by commas.",
    Markup.keyboard([
      ["Sports", "Music", "Travel"],
      ["Movies", "Food", "Books"],
      ["Done ✅"],
    ]).resize()
  );
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

    try {
      // Batch update profile with age, gender, and interests
      await profileService.updateProfile(ctx.from.id, {
        age: ctx.session.profileSetup.data.age,
        gender: ctx.session.profileSetup.data.gender,
        interests: ctx.session.profileSetup.data.interests,
      });
    } catch (error) {
      logger.error("Error updating profile:", error);
      return await ctx.reply("Sorry, there was an error. Please try again.");
    }

    ctx.session.profileSetup.step = "photo";
    return await ctx.reply(
      "Great! Finally, send me a photo of yourself.",
      Markup.removeKeyboard()
    );
  }

  const interests = ctx.message.text
    .split(",")
    .map((interest) => interest.trim())
    .filter((interest) => interest.length > 0);

  const currentInterests = ctx.session.profileSetup.data.interests || [];
  const updatedInterests = [...new Set([...currentInterests, ...interests])];

  ctx.session.profileSetup.data.interests = updatedInterests;

  await ctx.reply(
    `Added interests: ${interests.join(", ")}\n` +
      "You can add more interests or press 'Done ✅' to continue."
  );
}

async function handlePhotoInput(ctx: Context) {
  if (!ctx.message || !ctx.from) return;
  ensureProfileSetup(ctx);
  if (!("photo" in ctx.message)) {
    return await ctx.reply("Please send a photo.");
  }

  try {
    const photos = ctx.message.photo;
    // Check if multiple photos are uploaded
    if (photos.length > 1) {
      await ctx.reply("Please upload only one photo");
      return;
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
