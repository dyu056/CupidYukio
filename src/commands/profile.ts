import { Context } from "telegraf";
import { imageService } from "../services/image.service";
import { downloadTelegramFile } from "../middlewares/file.middleware";
import { User } from "../models/user.model";

export async function handleProfilePhoto(ctx: Context) {
  try {
    if (!ctx.message || !("photo" in ctx.message)) {
      await ctx.reply("Please send a photo!");
      return;
    }

    const photo = ctx.message.photo[0];
    const { buffer, mimeType, fileName } = await downloadTelegramFile(
      ctx,
      photo.file_id
    );

    // Upload to R2
    const imageUrl = await imageService.uploadImage(buffer, fileName, mimeType);

    // Update user profile
    const user = await User.findOne({ telegramId: ctx.from?.id });
    if (user) {
      // Delete old photo if exists
      if (user.photoUrl) {
        await imageService.deleteImage(user.photoUrl);
      }

      user.photoUrl = imageUrl;
      if (!user.isOnboarded) {
        user.isOnboarded = true;
      }
      await user.save();

      await ctx.reply("Profile photo updated successfully! ✨");
    }
  } catch (error) {
    console.error("Error handling profile photo:", error);
    await ctx.reply(
      "Sorry, there was an error updating your profile photo. Please try again."
    );
  }
}
