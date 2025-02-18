import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client } from "../config/r2";
import { environment } from "../config/environment";
import crypto from "crypto";

export class ImageService {
  private readonly client: S3Client;
  private readonly bucketName: string;
  private readonly allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor() {
    this.client = r2Client;
    this.bucketName = environment.R2_BUCKET_NAME;
  }

  /**
   * Generates a unique filename for the image
   */
  private generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString("hex");
    const extension = originalName.split(".").pop();
    return `${timestamp}-${randomString}.${extension}`;
  }

  /**
   * Validates the file before upload
   */
  private validateFile(size: number, mimeType: string): void {
    if (!this.allowedMimeTypes.includes(mimeType)) {
      throw new Error(
        `Invalid file type. Allowed types: ${this.allowedMimeTypes.join(", ")}`
      );
    }

    if (size > this.maxFileSize) {
      throw new Error(
        `File size exceeds ${this.maxFileSize / 1024 / 1024}MB limit`
      );
    }
  }

  /**
   * Uploads an image to R2 and returns the public URL
   */
  async uploadImage(
    file: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<string> {
    try {
      this.validateFile(file.length, mimeType);

      const fileName = this.generateFileName(originalName);
      const key = `profile-photos/${fileName}`;

      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: key,
          Body: file,
          ContentType: mimeType,
          CacheControl: "public, max-age=31536000", // 1 year cache
        })
      );

      return `${environment.R2_PUBLIC_URL}/${key}`;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error("Failed to upload image");
    }
  }

  /**
   * Generates a pre-signed URL for direct upload
   */
  async getPresignedUploadUrl(
    originalName: string,
    mimeType: string
  ): Promise<{ url: string; key: string }> {
    try {
      if (!this.allowedMimeTypes.includes(mimeType)) {
        throw new Error("Invalid file type");
      }

      const fileName = this.generateFileName(originalName);
      const key = `profile-photos/${fileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        ContentType: mimeType,
      });

      const url = await getSignedUrl(this.client, command, { expiresIn: 3600 }); // 1 hour

      return { url, key };
    } catch (error) {
      console.error("Error generating pre-signed URL:", error);
      throw new Error("Failed to generate upload URL");
    }
  }

  /**
   * Deletes an image from R2
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const key = imageUrl.replace(`${environment.R2_PUBLIC_URL}/`, "");

      await this.client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );
    } catch (error) {
      console.error("Error deleting image:", error);
      throw new Error("Failed to delete image");
    }
  }

  /**
   * Extracts key from full URL
   */
  private getKeyFromUrl(url: string): string {
    return url.replace(`${environment.R2_PUBLIC_URL}/`, "");
  }
}

// Export singleton instance
export const imageService = new ImageService();
