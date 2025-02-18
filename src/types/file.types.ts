export interface UploadedFile {
  url: string;
  key: string;
  mimeType: string;
  size: number;
}

export interface PresignedUrl {
  url: string;
  key: string;
  expires: number;
}
