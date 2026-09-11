import { and, asc, desc, eq, lte, ne, or } from "drizzle-orm";
import { db } from "../../db/client.js";
import { projectImages, projects, type Project, type ProjectImage } from "../../db/schema.js";
import { AppError, conflict, notFound } from "../../lib/errors.js";
import { detectImageType } from "../../lib/image-type.js";
import { slugify } from "../../lib/slug.js";
import {
  deleteImage,
  extensionFor,
  MAX_IMAGE_BYTES,
  MAX_IMAGES_PER_PROJECT,
  objectKey,
  putImage,
} from "../../storage/cloudinary.js";

export type ProjectWithImages = Project & { images: ProjectImage[] };
export type ProjectStatus = Project["status"];

function publiclyVisible() {
  const now = new Date();
  return or(eq(projects.status, "published"), and(eq(projects.status, "scheduled"), lte(projects.publishAt, now)));
}

function resolveSchedule(
  status: ProjectStatus,
  publishAt: string | Date | null | undefined,
): { status: ProjectStatus; publishAt: Date | null } {
  if (status === "draft") {
    return { status, publishAt: null };
  }
  if (status === "scheduled") {
    if (!publishAt) {
      throw new AppError(400, "VALIDATION_ERROR", "A publish time is required when status is scheduled");
    }
    const at = publishAt instanceof Date ? publishAt : new Date(publishAt);
    if (Number.isNaN(at.getTime())) {
      throw new AppError(400, "VALIDATION_ERROR", "Invalid publish time");
    }
    if (at.getTime() <= Date.now()) {
      return { status: "published", publishAt: at };
    }
    return { status, publishAt: at };
  }
  const at = publishAt ? (publishAt instanceof Date ? publishAt : new Date(publishAt)) : new Date();
  return { status: "published", publishAt: Number.isNaN(at.getTime()) ? new Date() : at };
}

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let candidate = base;
  let n = 2;
  for (;;) {
    const existing = await db.query.projects.findFirst({
      where: excludeId
        ? and(eq(projects.slug, candidate), ne(projects.id, excludeId))
        : eq(projects.slug, candidate),
      columns: { id: true },
    });
    if (!existing) return candidate;
    candidate = `${base}-${n}`;
    n += 1;
  }
}

export async function listProjects(): Promise<ProjectWithImages[]> {
  return db.query.projects.findMany({
    orderBy: [desc(projects.updatedAt)],
    with: {
      images: {
        orderBy: [asc(projectImages.sortOrder), asc(projectImages.createdAt)],
      },
    },
  });
}

export async function listPublishedProjects(): Promise<ProjectWithImages[]> {
  return db.query.projects.findMany({
    where: publiclyVisible(),
    orderBy: [desc(projects.updatedAt)],
    with: {
      images: {
        orderBy: [asc(projectImages.sortOrder), asc(projectImages.createdAt)],
      },
    },
  });
}

export async function getPublishedProjectBySlug(slug: string): Promise<ProjectWithImages> {
  const project = await db.query.projects.findFirst({
    where: and(eq(projects.slug, slug), publiclyVisible()),
    with: {
      images: {
        orderBy: [asc(projectImages.sortOrder), asc(projectImages.createdAt)],
      },
    },
  });
  if (!project) throw notFound("Project");
  return project;
}

export async function publishDueProjects(): Promise<number> {
  const due = await db
    .update(projects)
    .set({ status: "published", updatedAt: new Date() })
    .where(and(eq(projects.status, "scheduled"), lte(projects.publishAt, new Date())))
    .returning({ id: projects.id });
  return due.length;
}

export async function getProject(id: string): Promise<ProjectWithImages> {
  const project = await db.query.projects.findFirst({
    where: eq(projects.id, id),
    with: {
      images: {
        orderBy: [asc(projectImages.sortOrder), asc(projectImages.createdAt)],
      },
    },
  });
  if (!project) throw notFound("Project");
  return project;
}

export async function createProject(input: {
  title: string;
  description: string;
  status: ProjectStatus;
  publishAt?: string | null;
}): Promise<ProjectWithImages> {
  const schedule = resolveSchedule(input.status, input.publishAt);
  const slug = await uniqueSlug(slugify(input.title));
  const [created] = await db
    .insert(projects)
    .values({
      title: input.title,
      description: input.description,
      status: schedule.status,
      publishAt: schedule.publishAt,
      slug,
    })
    .returning();
  if (!created) throw new AppError(500, "CREATE_FAILED", "Could not create project");
  return { ...created, images: [] };
}

export async function updateProject(
  id: string,
  input: { title?: string; description?: string; status?: ProjectStatus; publishAt?: string | null },
): Promise<ProjectWithImages> {
  const current = await getProject(id);
  const nextTitle = input.title ?? current.title;
  const nextStatus = input.status ?? current.status;
  const incomingPublishAt = input.publishAt !== undefined ? input.publishAt : current.publishAt;
  const schedule = resolveSchedule(nextStatus, incomingPublishAt);
  const unlocked = current.status === "draft" || current.status === "scheduled";
  const shouldRefreshSlug = Boolean(input.title) && unlocked;
  const slug = shouldRefreshSlug ? await uniqueSlug(slugify(nextTitle), id) : current.slug;

  const [updated] = await db
    .update(projects)
    .set({
      title: nextTitle,
      description: input.description ?? current.description,
      status: schedule.status,
      publishAt: schedule.publishAt,
      slug,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, id))
    .returning();
  if (!updated) throw notFound("Project");
  return { ...updated, images: current.images };
}

export async function deleteProject(id: string): Promise<void> {
  const project = await getProject(id);
  for (const image of project.images) {
    await deleteImage(image.storageKey);
  }
  await db.delete(projects).where(eq(projects.id, id));
}

export async function addImages(
  projectId: string,
  files: Array<{ filename: string; mimetype: string; buffer: Buffer }>,
): Promise<ProjectImage[]> {
  if (files.length === 0) {
    throw new AppError(400, "VALIDATION_ERROR", "At least one image is required");
  }

  const project = await getProject(projectId);
  if (project.images.length + files.length > MAX_IMAGES_PER_PROJECT) {
    throw new AppError(
      400,
      "TOO_MANY_IMAGES",
      `A project can have at most ${MAX_IMAGES_PER_PROJECT} images`,
    );
  }

  const nextOrderStart =
    project.images.reduce((max, image) => Math.max(max, image.sortOrder), -1) + 1;

  const created: ProjectImage[] = [];
  let index = 0;
  for (const file of files) {
    if (file.buffer.byteLength > MAX_IMAGE_BYTES) {
      throw new AppError(413, "FILE_TOO_LARGE", `Each image must be under ${MAX_IMAGE_BYTES / (1024 * 1024)} MB`);
    }
    if (file.buffer.byteLength === 0) {
      throw new AppError(400, "EMPTY_FILE", `${file.filename || "Image"} is empty`);
    }

    const contentType = detectImageType(file.buffer);
    if (!contentType) {
      throw new AppError(
        415,
        "UNSUPPORTED_TYPE",
        "File is not a valid JPEG, PNG, WebP, or AVIF image",
      );
    }

    const key = objectKey(projectId, file.filename || `image.${extensionFor(contentType)}`, contentType);
    const url = await putImage({ key, body: file.buffer, contentType });
    const [row] = await db
      .insert(projectImages)
      .values({
        projectId,
        storageKey: key,
        url,
        contentType,
        sizeBytes: file.buffer.byteLength,
        sortOrder: nextOrderStart + index,
      })
      .returning();
    if (!row) throw new AppError(500, "CREATE_FAILED", "Could not save image metadata");
    created.push(row);
    index += 1;
  }

  await db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, projectId));
  return created;
}

export async function updateImage(
  projectId: string,
  imageId: string,
  input: { alt: string },
): Promise<ProjectImage> {
  const [updated] = await db
    .update(projectImages)
    .set({ alt: input.alt })
    .where(and(eq(projectImages.id, imageId), eq(projectImages.projectId, projectId)))
    .returning();
  if (!updated) throw notFound("Image");
  return updated;
}

export async function reorderImages(projectId: string, imageIds: string[]): Promise<ProjectImage[]> {
  const project = await getProject(projectId);
  const existing = new Set(project.images.map((image) => image.id));
  if (imageIds.length !== existing.size || imageIds.some((id) => !existing.has(id))) {
    throw conflict("Image list does not match this project");
  }

  await db.transaction(async (tx) => {
    for (const [sortOrder, imageId] of imageIds.entries()) {
      await tx
        .update(projectImages)
        .set({ sortOrder })
        .where(and(eq(projectImages.id, imageId), eq(projectImages.projectId, projectId)));
    }
    await tx.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, projectId));
  });

  return getProject(projectId).then((row) => row.images);
}

export async function removeImage(projectId: string, imageId: string): Promise<void> {
  const image = await db.query.projectImages.findFirst({
    where: and(eq(projectImages.id, imageId), eq(projectImages.projectId, projectId)),
  });
  if (!image) return;
  await deleteImage(image.storageKey);
  await db.delete(projectImages).where(eq(projectImages.id, imageId));
  await db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, projectId));
}


