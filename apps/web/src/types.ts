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

export type ApiError = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};
