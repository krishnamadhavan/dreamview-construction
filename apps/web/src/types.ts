import type { ProjectKind } from "./lib/projectKind";

export type ProjectStatus = "draft" | "scheduled" | "published";
export type { ProjectKind };

export type ProjectImage = {
  id: string;
  projectId: string;
  storageKey: string;
  url: string;
  alt: string;
  contentType: string;
  sizeBytes: number;
  sortOrder: number;
  createdAt: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  year: string;
  kind: ProjectKind;
  status: ProjectStatus;
  publishAt: string | null;
  createdAt: string;
  updatedAt: string;
  images: ProjectImage[];
};

export type Admin = {
  id: string;
  email: string;
};

export type PublicProjectImage = {
  id: string;
  url: string;
  alt: string;
  sortOrder: number;
};

export type PublicProject = {
  id: string;
  title: string;
  slug: string;
  description: string;
  location: string;
  year: string;
  kind: ProjectKind;
  images: PublicProjectImage[];
};

export type SiteEntryKind =
  | "person"
  | "voice"
  | "award"
  | "journal"
  | "faq"
  | "client"
  | "service"
  | "step";

export type SiteSettings = {
  studioHeading: string;
  studioBody: string;
  territoryHeading: string;
  territoryBody: string;
  enquireHeading: string;
  enquireBody: string;
  phone: string;
  whatsapp: string;
  email: string;
  studioNote: string;
  heroImageUrl: string;
  heroKicker: string;
  heroHeading: string;
  heroBody: string;
};

export type SiteEntry = {
  id: string;
  kind: SiteEntryKind;
  title: string;
  subtitle: string;
  body: string;
  imageUrl: string;
  sortOrder: number;
};

export type SiteContent = {
  settings: SiteSettings;
  entries: SiteEntry[];
};

export type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone: string;
  site: string;
  brief: string;
  readAt: string | null;
  createdAt: string;
};

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
