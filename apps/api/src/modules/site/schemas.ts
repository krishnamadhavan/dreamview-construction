import { z } from "zod";

export const siteEntryKindSchema = z.enum([
  "person",
  "voice",
  "award",
  "journal",
  "faq",
  "client",
  "service",
  "step",
]);

export const siteSettingsBody = z.object({
  studioHeading: z.string().max(200),
  studioBody: z.string().max(20_000),
  territoryHeading: z.string().max(200),
  territoryBody: z.string().max(8_000),
  enquireHeading: z.string().max(200),
  enquireBody: z.string().max(8_000),
  phone: z.string().max(80),
  email: z.string().max(200),
  studioNote: z.string().max(200),
});

export const siteEntryBody = z.object({
  id: z.string().uuid().optional(),
  kind: siteEntryKindSchema,
  title: z.string().max(300),
  subtitle: z.string().max(300),
  body: z.string().max(8_000),
  imageUrl: z.string().max(2_000),
  sortOrder: z.number().int().min(0),
});

export const saveSiteBody = z.object({
  settings: siteSettingsBody,
  entries: z.array(siteEntryBody).max(80),
});
