import type { Admin, ApiError, Enquiry, Project, ProjectImage, PublicProject, SiteContent } from "./types";

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(path, {
    ...init,
    headers,
    credentials: "include",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const data = (await response.json().catch(() => null)) as T | ApiError | null;
  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? data.error.message
        : `Request failed (${response.status})`;
    throw new Error(message);
  }
  return data as T;
}

export const api = {
  me: () => request<{ admin: Admin }>("/api/auth/me"),
  login: (email: string, password: string) =>
    request<{ admin: Admin }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  logout: () => request<{ ok: true }>("/api/auth/logout", { method: "POST" }),
  listPublishedProjects: () => request<{ projects: PublicProject[] }>("/api/public/projects"),
  getPublishedProject: (slug: string) =>
    request<{ project: PublicProject }>(`/api/public/projects/${slug}`),
  listProjects: () => request<{ projects: Project[] }>("/api/projects"),
  getProject: (id: string) => request<{ project: Project }>(`/api/projects/${id}`),
  createProject: (body: {
    title: string;
    description: string;
    location: string;
    year: string;
    kind: Project["kind"];
    status: Project["status"];
    publishAt?: string | null;
  }) =>
    request<{ project: Project }>("/api/projects", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateProject: (
    id: string,
    body: Partial<{
      title: string;
      description: string;
      location: string;
      year: string;
      kind: Project["kind"];
      status: Project["status"];
      publishAt: string | null;
    }>,
  ) =>
    request<{ project: Project }>(`/api/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
  deleteProject: (id: string) => request<void>(`/api/projects/${id}`, { method: "DELETE" }),
  uploadImages: (id: string, files: File[]) => {
    const form = new FormData();
    for (const file of files) form.append("images", file);
    return request<{ images: ProjectImage[] }>(`/api/projects/${id}/images`, {
      method: "POST",
      body: form,
    });
  },
  updateImage: (projectId: string, imageId: string, alt: string) =>
    request<{ image: ProjectImage }>(`/api/projects/${projectId}/images/${imageId}`, {
      method: "PATCH",
      body: JSON.stringify({ alt }),
    }),
  reorderImages: (projectId: string, imageIds: string[]) =>
    request<{ images: ProjectImage[] }>(`/api/projects/${projectId}/images/order`, {
      method: "PUT",
      body: JSON.stringify({ imageIds }),
    }),
  deleteImage: (projectId: string, imageId: string) =>
    request<void>(`/api/projects/${projectId}/images/${imageId}`, { method: "DELETE" }),
  getPublicSite: () => request<{ site: SiteContent }>("/api/public/site"),
  getSite: () => request<{ site: SiteContent }>("/api/site"),
  saveSite: (site: SiteContent) =>
    request<{ site: SiteContent }>("/api/site", {
      method: "PUT",
      body: JSON.stringify(site),
    }),
  uploadSiteHero: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return request<{ site: SiteContent }>("/api/site/hero", {
      method: "POST",
      body: form,
    });
  },
  deleteSiteHero: () => request<{ site: SiteContent }>("/api/site/hero", { method: "DELETE" }),
  uploadSiteImage: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return request<{ url: string }>("/api/site/image", {
      method: "POST",
      body: form,
    });
  },
  sendEnquiry: (body: {
    name: string;
    email: string;
    phone?: string;
    site: string;
    brief: string;
    website_url?: string;
  }) =>
    request<{ ok: true }>("/api/public/enquire", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  listEnquiries: () => request<{ enquiries: Enquiry[]; unread: number }>("/api/enquiries"),
  markEnquiryRead: (id: string) =>
    request<{ enquiry: Enquiry }>(`/api/enquiries/${id}`, { method: "PATCH" }),
  deleteEnquiry: (id: string) => request<void>(`/api/enquiries/${id}`, { method: "DELETE" }),
};
