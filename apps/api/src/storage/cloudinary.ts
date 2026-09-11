import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { randomUUID } from "node:crypto";
import { loadConfig } from "../config.js";
import { AppError } from "../lib/errors.js";

const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

const CLOUDINARY_FORMATS = ["jpg", "jpeg", "png", "webp", "avif"] as const;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGES_PER_PROJECT = 24;

const config = loadConfig();
const hasCredentials = Boolean(
  config.cloudinary.cloudName && config.cloudinary.apiKey && config.cloudinary.apiSecret,
);

if (hasCredentials) {
  cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
    secure: true,
  });
}

function requireStorage(): void {
  if (!hasCredentials) {
    throw new AppError(
      503,
      "STORAGE_NOT_CONFIGURED",
      "Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to upload or delete images",
    );
  }
}

export function extensionFor(contentType: string): string {
  return ALLOWED_TYPES.get(contentType) ?? "bin";
}

export function objectKey(projectId: string, originalName: string, contentType: string): string {
  const ext = extensionFor(contentType);
  const safe = originalName
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const leaf = safe ? `${safe}-${randomUUID().slice(0, 8)}` : randomUUID();
  return `projects/${projectId}/${leaf}-${ext}`;
}

export async function putImage(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  requireStorage();
  const uploaded = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        public_id: params.key,
        resource_type: "image",
        overwrite: false,
        unique_filename: false,
        use_filename: false,
        allowed_formats: [...CLOUDINARY_FORMATS],
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error("Cloudinary upload failed"));
          return;
        }
        resolve(result);
      },
    );
    stream.end(params.body);
  });

  const format = uploaded.format?.toLowerCase() ?? "";
  if (!CLOUDINARY_FORMATS.includes(format as (typeof CLOUDINARY_FORMATS)[number])) {
    await cloudinary.uploader.destroy(params.key, { resource_type: "image", invalidate: true });
    throw new AppError(415, "UNSUPPORTED_TYPE", "File is not a valid JPEG, PNG, WebP, or AVIF image");
  }

  return uploaded.secure_url;
}

export async function deleteImage(key: string): Promise<void> {
  requireStorage();
  const result = await cloudinary.uploader.destroy(key, {
    resource_type: "image",
    invalidate: true,
  });
  if (result.result !== "ok" && result.result !== "not found") {
    throw new AppError(502, "STORAGE_DELETE_FAILED", "Could not delete image from Cloudinary");
  }
}

export async function storageReady(): Promise<boolean> {
  if (!hasCredentials) return false;
  try {
    const ping = await cloudinary.api.ping();
    return ping.status === "ok";
  } catch {
    return false;
  }
}
