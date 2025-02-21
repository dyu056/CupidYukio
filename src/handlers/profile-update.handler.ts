import { Context, Markup } from "telegraf";
import { profileService } from "../services/profile.service";
import { logger } from "../utils/logger";

export async function handleProfileUpdate(ctx: Context) {
  if (!ctx.from) return;

  // Show update options menu
  await ctx.reply(
    "What would you like to update?",
    Markup.keyboard([
      ["Name 📛", "Age ⌛", "Gender ⚧"],
      ["Photo 📸", "Interests 🎯"],
      ["About ✍️", "Cancel ❌"],
    ]).resize()
  );
}

export async function handleUpdateField(ctx: Context) {
  if (!ctx.message || !("text" in ctx.message) || !ctx.from) return;
  if (!ctx.session) ctx.session = {};

  const action = ctx.message.text;

  // Handle update field selection
  if (!ctx.session.updateField) {
    switch (action) {
      case "Name 📛":
        await ctx.reply(
          "Please enter your new name:",
          Markup.keyboard([["Cancel ❌"]]).resize()
        );
        ctx.session.updateField = "name";
        break;

      case "Age ⌛":
        await ctx.reply(
          "Please enter your new age:",
          Markup.keyboard([["Cancel ❌"]]).resize()
        );
        ctx.session.updateField = "age";
        break;

      case "Gender ⚧":
        await ctx.reply(
          "Please select your gender:",
          Markup.keyboard([["Male 👨", "Female 👩"], ["Other 🌈"]]).resize()
        );
        ctx.session.updateField = "gender";
        break;

      case "Interests 🎯":
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
        ctx.session.newInterests = [];
        break;

      case "Photo 📸":
        await ctx.reply(
          "Please send me your new profile photo.\nOnly photos are accepted, other messages will be ignored.",
          Markup.keyboard([["Cancel ❌"]]).resize()
        );
        ctx.session.updateField = "photo";
        break;

      case "About ✍️":
        await ctx.reply(
          "Share your new one-liner! 🌟\n" +
            "It could be a pickup line, joke, or anything catchy!\n" +
            "(Keep it under 150 characters)",
          Markup.keyboard([["Cancel ❌"]]).resize()
        );
        ctx.session.updateField = "about";
        break;

      case "Cancel ❌":
        delete ctx.session.updateField;
        delete ctx.session.newInterests;
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
    delete ctx.session.newInterests;
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
          if (!ctx.session.newInterests?.length) {
            return await ctx.reply("Please add at least one interest.");
          }
          await profileService.updateProfile(ctx.from.id, {
            interests: ctx.session.newInterests,
          });
          delete ctx.session.updateField;
          delete ctx.session.newInterests;
        } else {
          const interests = ctx.message.text
            .split(",")
            .map((i) => i.trim())
            .filter((i) => i.length > 0);

          const updatedInterests = [
            ...(ctx.session.newInterests || []),
            ...interests,
          ];

          // Check if total interests exceed 5
          if (updatedInterests.length > 5) {
            return await ctx.reply(
              "You can only have up to 5 interests. Please remove some before adding more."
            );
          }

          ctx.session.newInterests = updatedInterests;
          return await ctx.reply(
            `Added: ${interests.join(", ")}\n` +
              `You have ${updatedInterests.length}/5 interests.\n` +
              "You can add more or press 'Done ✅' to save."
          );
        }
        break;

      case "about":
        console.log("About update");
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
