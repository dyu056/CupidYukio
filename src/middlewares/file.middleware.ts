import { Context } from "telegraf";
import axios from "axios";

export async function downloadTelegramFile(
  ctx: Context,
  fileId: string
): Promise<{ buffer: Buffer; mimeType: string; fileName: string }> {
  try {
    // Get file info from Telegram
    const file = await ctx.telegram.getFile(fileId);
    const filePath = file.file_path;

    if (!filePath) {
      throw new Error("Could not get file path");
    }

    // Download file
    const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${filePath}`;
    const response = await axios.get(fileUrl, { responseType: "arraybuffer" });

    // Get mime type from file path
    const mimeType = getMimeType(filePath);
    const fileName = `telegram_${Date.now()}_${fileId}.${getExtension(filePath)}`;

    return {
      buffer: Buffer.from(response.data),
      mimeType,
      fileName,
    };
  } catch (error) {
    console.error("Error downloading file from Telegram:", error);
    throw new Error("Failed to download file");
  }
}

function getMimeType(filePath: string): string {
  const extension = getExtension(filePath);
  const mimeTypes: { [key: string]: string } = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };

  return mimeTypes[extension] || "application/octet-stream";
}

function getExtension(filePath: string): string {
  return filePath.split(".").pop()?.toLowerCase() || "";
}
