import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";

export const projectStatusEnum = pgEnum("project_status", ["draft", "scheduled", "published"]);
export const siteEntryKindEnum = pgEnum("site_entry_kind", [
  "person",
  "voice",
  "award",
  "journal",
  "faq",
  "client",
  "service",
  "step",
]);

export const admins = pgTable("admins", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable(
  "projects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull().default(""),
    status: projectStatusEnum("status").notNull().default("draft"),
    publishAt: timestamp("publish_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("projects_status_idx").on(table.status),
    index("projects_scheduled_publish_idx").on(table.publishAt),
  ],
);

export const projectImages = pgTable(
  "project_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    storageKey: text("storage_key").notNull(),
    url: text("url").notNull(),
    alt: text("alt").notNull().default(""),
    contentType: text("content_type").notNull(),
    sizeBytes: integer("size_bytes").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("project_images_project_sort_idx").on(table.projectId, table.sortOrder)],
);

export const projectsRelations = relations(projects, ({ many }) => ({
  images: many(projectImages),
}));

export const projectImagesRelations = relations(projectImages, ({ one }) => ({
  project: one(projects, {
    fields: [projectImages.projectId],
    references: [projects.id],
  }),
}));

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  studioHeading: text("studio_heading").notNull().default("A construction practice that still draws."),
  studioBody: text("studio_body").notNull().default(""),
  territoryHeading: text("territory_heading").notNull().default("Where we work"),
  territoryBody: text("territory_body").notNull().default(""),
  enquireHeading: text("enquire_heading").notNull().default("Tell us about the site."),
  enquireBody: text("enquire_body").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  studioNote: text("studio_note").notNull().default("By appointment"),
  heroImageUrl: text("hero_image_url").notNull().default(""),
  heroImageKey: text("hero_image_key").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteEntries = pgTable(
  "site_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    kind: siteEntryKindEnum("kind").notNull(),
    title: text("title").notNull().default(""),
    subtitle: text("subtitle").notNull().default(""),
    body: text("body").notNull().default(""),
    imageUrl: text("image_url").notNull().default(""),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("site_entries_kind_sort_idx").on(table.kind, table.sortOrder)],
);

export type Project = typeof projects.$inferSelect;
export type ProjectImage = typeof projectImages.$inferSelect;
export type Admin = typeof admins.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
export type SiteEntry = typeof siteEntries.$inferSelect;
export type SiteEntryKind = (typeof siteEntryKindEnum.enumValues)[number];
