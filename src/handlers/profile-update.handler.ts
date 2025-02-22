import { Context, Markup } from "telegraf";
import { profileService } from "../services/profile.service";
import { logger } from "../utils/logger";
import { User } from "../models/user.model";

enum UPDATE_ACTIONS {
  "Name 📛" = "name_69",
  "Age ⌛" = "age_69",
  "Gender ⚧" = "gender_69",
  "Interests 🎯" = "interests_69",
  "Photo 📸" = "photo_69",
  "About ✍️" = "about_69",
  "Cancel ❌" = "cancel_69",
  "name_69" = "Name 📛",
  "age_69" = "Age ⌛",
  "gender_69" = "Gender ⚧",
  "interests_69" = "Interests 🎯",
  "photo_69" = "Photo 📸",
  "about_69" = "About ✍️",
  "cancel_69" = "Cancel ❌",
}

const UPDATE_ACTIONS_KEYBOARD = [
  ["Name 📛", "Age ⌛", "Gender ⚧"],
  ["Photo 📸", "Interests 🎯"],
  ["About ✍️", "Cancel ❌"],
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

      case UPDATE_ACTIONS.interests_69:
        await ctx.reply(
          "Let's update your interests!\nYou can enter multiple interests(Max 5) separated by commas.",
          Markup.keyboard([
            ["Coffee", "Music", "Beaches"],
            ["Anime", "Mountains", "Chai"],
            ["Cafe Hopping", "Writing", "Reading"],
            ["Done ✅"],
          ]).resize()
        );
        ctx.session.updateField = "interests";
        break;

      case UPDATE_ACTIONS.photo_69:
        await ctx.reply(
          "Please send me your new profile photo.\nOnly photos are accepted, other messages will be ignored.",
          Markup.keyboard([["Cancel ❌"]]).resize()
        );
        ctx.session.updateField = "photo";
        break;

      case UPDATE_ACTIONS.about_69:
        await ctx.reply(
          "Share your new one-liner! 🌟\n" +
            "It could be a pickup line, joke, or anything catchy!\n" +
            "(Keep it under 150 characters)",
          Markup.keyboard([["Cancel ❌"]]).resize()
        );
        ctx.session.updateField = "about";
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

      case "interests":
        if (ctx.message.text === "Done ✅") {
          // Get current user with interests
          const user = await User.findOne({ telegramId: ctx.from.id });
          if (!user?.interests?.length) {
            return await ctx.reply("Please add at least one interest.");
          }
          delete ctx.session.updateField;
          break;
        } else {
          // Parse new interests from message
          const newInterests = ctx.message.text
            .split(",")
            .map((i) => i.trim())
            .filter((i) => i.length > 0);

          // Get current interests from database
          const user = await User.findOne({ telegramId: ctx.from.id });
          const currentInterests = user?.interests || [];

          // Combine and deduplicate interests
          const updatedInterests = [
            ...new Set([...currentInterests, ...newInterests]),
          ];

          // Check if total interests exceed 5
          if (updatedInterests.length > 5) {
            return await ctx.reply(
              "You can only have up to 5 interests. Please remove some before adding more."
            );
          }

          // Update interests directly in database
          await profileService.updateProfile(ctx.from.id, {
            interests: updatedInterests,
          });

          return await ctx.reply(
            `Added: ${newInterests.join(", ")}\n` +
              `You have ${updatedInterests.length}/5 interests.\n` +
              "You can add more or press 'Done ✅' to save."
          );
        }
        break;

      case "about":
        const about = ctx.message.text.trim();
        await profileService.updateProfile(ctx.from.id, { about });
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
