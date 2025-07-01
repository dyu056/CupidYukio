import { Context, Markup } from "telegraf";
import { profileService } from "../services/profile.service";
import { logger } from "../utils/logger";
import { User } from "../models/user.model";

enum UPDATE_ACTIONS {
  "Name 📛" = "name_69",
  "Age ⌛" = "age_69",
  "Gender ⚧" = "gender_69",
  "Photo 📸" = "photo_69",
  "Cancel ❌" = "cancel_69",
  "name_69" = "Name 📛",
  "age_69" = "Age ⌛",
  "gender_69" = "Gender ⚧",
  "photo_69" = "Photo 📸",
  "cancel_69" = "Cancel ❌",
}

const UPDATE_ACTIONS_KEYBOARD = [
  ["Name 📛", "Age ⌛", "Gender ⚧"],
  ["Photo 📸", "Cancel ❌"],
];

export async function handleProfileUpdate(ctx: Context) {
  if (!ctx.from) return;

  // Show update options menu
  await ctx.reply(
    "What would you like to update?",
    Markup.keyboard(UPDATE_ACTIONS_KEYBOARD).resize()
  );
}

export async function handleUpdateField(ctx: Context) {
  if (!ctx.message || !("text" in ctx.message) || !ctx.from) return;
  if (!ctx.session) ctx.session = {};

  const action = ctx.message.text;
  const actionEnum = UPDATE_ACTIONS[action as keyof typeof UPDATE_ACTIONS];
  if (actionEnum) {
    delete ctx.session.updateField;
  }

  // Handle update field selection
  if (!ctx.session.updateField) {
    switch (action) {
      case UPDATE_ACTIONS.name_69:
        await ctx.reply(
          "Please enter your new name:",
          Markup.keyboard([["Cancel ❌"]]).resize()
        );
        ctx.session.updateField = "name";
        break;

      case UPDATE_ACTIONS.age_69:
        await ctx.reply(
          "Please enter your new age:",
          Markup.keyboard([["Cancel ❌"]]).resize()
        );
        ctx.session.updateField = "age";
        break;

      case UPDATE_ACTIONS.gender_69:
        await ctx.reply(
          "Please select your gender:",
          Markup.keyboard([["Male 👨", "Female 👩"], ["Other 🌈"]]).resize()
        );
        ctx.session.updateField = "gender";
        break;

      case UPDATE_ACTIONS.photo_69:
        await ctx.reply(
          "Please send me your new profile photo.\nOnly photos are accepted, other messages will be ignored.",
          Markup.keyboard([["Cancel ❌"]]).resize()
        );
        ctx.session.updateField = "photo";
        break;

      case UPDATE_ACTIONS.cancel_69:
        delete ctx.session.updateField;
        await ctx.reply(
          "Update cancelled. Back to profile.",
          Markup.keyboard([
            ["My Profile 👤", "Browse Matches 👥"],
            ["My Matches 💕", "Update Profile ✏️"],
          ]).resize()
        );
        break;

      default:
        return;
    }
    return;
  }

  // Handle update value input
  await handleUpdateValue(ctx);
}

async function handleUpdateValue(ctx: Context) {
  if (!ctx.message || !("text" in ctx.message) || !ctx.from) return;
  if (!ctx.session) ctx.session = {};

  const field = ctx.session.updateField;
  if (!field) return;

  // Handle cancel action for all fields
  if (ctx.message.text === "Cancel ❌") {
    delete ctx.session.updateField;
    await ctx.reply(
      "Update cancelled. Back to profile.",
      Markup.keyboard([
        ["My Profile 👤", "Browse Matches 👥"],
        ["My Matches 💕", "Update Profile ✏️"],
      ]).resize()
    );
    return;
  }

  try {
    // Get current user data from DB
    const currentUser = await User.findOne({ telegramId: ctx.from.id });
    if (!currentUser) {
      throw new Error("User not found");
    }

    switch (field) {
      case "name":
        const name = ctx.message.text.trim();
        if (name.length < 2) {
          return await ctx.reply(
            "Please enter a valid name (at least 2 characters)."
          );
        }
        await profileService.updateProfile(ctx.from.id, { name });
        delete ctx.session.updateField;
        break;

      case "age":
        if (!profileService.validateAge(ctx.message.text)) {
          return await ctx.reply(
            "Please enter a valid age between 15 and 100."
          );
        }
        await profileService.updateProfile(ctx.from.id, {
          age: ctx.message.text,
        });
        delete ctx.session.updateField;
        break;

      case "gender":
        const genderInput = ctx.message.text
          .toLowerCase()
          .replace(/[^a-zA-Z]/g, "");
        if (!profileService.validateGender(genderInput)) {
          return await ctx.reply(
            "Please select a gender using the buttons provided."
          );
        }
        await profileService.updateProfile(ctx.from.id, {
          gender: genderInput,
        });
        delete ctx.session.updateField;
        break;
    }

    // Show success message and return to profile
    await ctx.reply(
      "Profile updated successfully! ✨",
      Markup.keyboard([
        ["My Profile 👤", "Browse Matches 👥"],
        ["My Matches 💕", "Update Profile ✏️"],
      ]).resize()
    );
  } catch (error) {
    logger.error("Error updating profile:", error);
    await ctx.reply("Sorry, there was an error updating your profile.");
  }
}
