import { S3Client } from "@aws-sdk/client-s3";
import { environment } from "./environment";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${environment.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: environment.R2_ACCESS_KEY_ID,
    secretAccessKey: environment.R2_SECRET_ACCESS_KEY,
  },
});
