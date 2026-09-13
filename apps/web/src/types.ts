export type ProjectStatus = "draft" | "scheduled" | "published";

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
  email: string;
  studioNote: string;
  heroImageUrl: string;
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

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
