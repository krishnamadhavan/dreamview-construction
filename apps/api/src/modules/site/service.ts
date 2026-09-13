import { asc, eq } from "drizzle-orm";
import { db } from "../../db/client.js";
import { siteEntries, siteSettings, type SiteEntry, type SiteSettings } from "../../db/schema.js";
import { AppError } from "../../lib/errors.js";
import { detectImageType } from "../../lib/image-type.js";
import { deleteImage, extensionFor, MAX_IMAGE_BYTES, putImage, siteHeroKey } from "../../storage/cloudinary.js";

export type SiteContent = {
  settings: SiteSettings;
  entries: SiteEntry[];
};

async function ensureSettings(): Promise<SiteSettings> {
  const existing = await db.select().from(siteSettings).limit(1);
  if (existing[0]) return existing[0];
  const [created] = await db.insert(siteSettings).values({}).returning();
  if (!created) throw new Error("Could not create site settings");
  return created;
}

export async function getSiteContent(): Promise<SiteContent> {
  const settings = await ensureSettings();
  const entries = await db.select().from(siteEntries).orderBy(asc(siteEntries.sortOrder), asc(siteEntries.createdAt));
  return { settings, entries };
}

export async function saveSiteContent(input: {
  settings: {
    studioHeading: string;
    studioBody: string;
    territoryHeading: string;
    territoryBody: string;
    enquireHeading: string;
    enquireBody: string;
    phone: string;
    email: string;
    studioNote: string;
  };
  entries: Array<{
    id?: string;
    kind: SiteEntry["kind"];
    title: string;
    subtitle: string;
    body: string;
    imageUrl: string;
    sortOrder: number;
  }>;
}): Promise<SiteContent> {
  const current = await ensureSettings();
  const [settings] = await db
    .update(siteSettings)
    .set({ ...input.settings, updatedAt: new Date() })
    .where(eq(siteSettings.id, current.id))
    .returning();

  await db.delete(siteEntries);
  if (input.entries.length > 0) {
    await db.insert(siteEntries).values(
      input.entries.map((entry, index) => ({
        id: entry.id,
        kind: entry.kind,
        title: entry.title,
        subtitle: entry.subtitle,
        body: entry.body,
        imageUrl: entry.imageUrl,
        sortOrder: entry.sortOrder ?? index,
        updatedAt: new Date(),
      })),
    );
  }

  const entries = await db.select().from(siteEntries).orderBy(asc(siteEntries.sortOrder), asc(siteEntries.createdAt));
  return { settings: settings ?? current, entries };
}

export async function setHeroImage(file: {
  filename: string;
  buffer: Buffer;
}): Promise<SiteContent> {
  if (file.buffer.byteLength === 0) {
    throw new AppError(400, "EMPTY_FILE", `${file.filename || "Image"} is empty`);
  }
  if (file.buffer.byteLength > MAX_IMAGE_BYTES) {
    throw new AppError(413, "FILE_TOO_LARGE", `Each image must be under ${MAX_IMAGE_BYTES / (1024 * 1024)} MB`);
  }

  const contentType = detectImageType(file.buffer);
  if (!contentType) {
    throw new AppError(415, "UNSUPPORTED_TYPE", "File is not a valid JPEG, PNG, WebP, or AVIF image");
  }

  const current = await ensureSettings();
  const key = siteHeroKey(file.filename || `cover.${extensionFor(contentType)}`, contentType);
  const url = await putImage({ key, body: file.buffer, contentType });

  const [settings] = await db
    .update(siteSettings)
    .set({ heroImageUrl: url, heroImageKey: key, updatedAt: new Date() })
    .where(eq(siteSettings.id, current.id))
    .returning();

  if (current.heroImageKey && current.heroImageKey !== key) {
    await deleteImage(current.heroImageKey).catch(() => undefined);
  }

  const entries = await db.select().from(siteEntries).orderBy(asc(siteEntries.sortOrder), asc(siteEntries.createdAt));
  return { settings: settings ?? { ...current, heroImageUrl: url, heroImageKey: key }, entries };
}

export async function clearHeroImage(): Promise<SiteContent> {
  const current = await ensureSettings();
  if (current.heroImageKey) {
    await deleteImage(current.heroImageKey).catch(() => undefined);
  }

  const [settings] = await db
    .update(siteSettings)
    .set({ heroImageUrl: "", heroImageKey: "", updatedAt: new Date() })
    .where(eq(siteSettings.id, current.id))
    .returning();

  const entries = await db.select().from(siteEntries).orderBy(asc(siteEntries.sortOrder), asc(siteEntries.createdAt));
  return { settings: settings ?? { ...current, heroImageUrl: "", heroImageKey: "" }, entries };
}
