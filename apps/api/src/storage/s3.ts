import {
  DeleteObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { loadConfig } from "../config.js";

const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGES_PER_PROJECT = 24;

const config = loadConfig();

export const s3 = new S3Client({
  region: config.s3.region,
  endpoint: config.s3.endpoint,
  forcePathStyle: config.s3.forcePathStyle,
  credentials: {
    accessKeyId: config.s3.accessKeyId,
    secretAccessKey: config.s3.secretAccessKey,
  },
});

export function isAllowedImageType(contentType: string): boolean {
  return ALLOWED_TYPES.has(contentType);
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
  const leaf = safe ? `${safe}-${randomUUID().slice(0, 8)}.${ext}` : `${randomUUID()}.${ext}`;
  return `projects/${projectId}/${leaf}`;
}

export function publicUrlFor(key: string): string {
  return `${config.s3.publicUrl}/${key}`;
}

export async function putImage(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<string> {
  await s3.send(
    new PutObjectCommand({
      Bucket: config.s3.bucket,
      Key: params.key,
      Body: params.body,
      ContentType: params.contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return publicUrlFor(params.key);
}

export async function deleteImage(key: string): Promise<void> {
  await s3.send(
    new DeleteObjectCommand({
      Bucket: config.s3.bucket,
      Key: key,
    }),
  );
}

export async function storageReady(): Promise<boolean> {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: config.s3.bucket }));
    return true;
  } catch {
    return false;
  }
}
